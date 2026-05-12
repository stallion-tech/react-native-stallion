//
//  bspatch.c
//  react-native-stallion
//
//  Based on original bsdiff/bspatch by Colin Percival
//  Adapted for iOS library use with bzip2-compressed BSDIFF40 format
//

#include "bspatch_bridge.h"

#include <bzlib.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <sys/types.h>
#include <unistd.h>
#include <fcntl.h>

// Error codes (negative)
#define BSPATCH_ERR_OPEN_OLD     -1
#define BSPATCH_ERR_OPEN_NEW     -2
#define BSPATCH_ERR_OPEN_PATCH   -3
#define BSPATCH_ERR_READ_HDR     -4
#define BSPATCH_ERR_BAD_MAGIC    -5
#define BSPATCH_ERR_READ_CTRL    -6
#define BSPATCH_ERR_READ_DIFF    -7
#define BSPATCH_ERR_READ_EXTRA   -8
#define BSPATCH_ERR_SEEK_OLD     -9
#define BSPATCH_ERR_WRITE_NEW    -10
#define BSPATCH_ERR_BZ2_ERROR    -11
#define BSPATCH_ERR_OVERFLOW     -12

/* Type compatibility */
#ifndef u_char
#define u_char unsigned char
#endif

static off_t offtin(u_char *buf)
{
  off_t y;

  y=buf[7]&0x7F;
  y=y*256;y+=buf[6];
  y=y*256;y+=buf[5];
  y=y*256;y+=buf[4];
  y=y*256;y+=buf[3];
  y=y*256;y+=buf[2];
  y=y*256;y+=buf[1];
  y=y*256;y+=buf[0];

  if(buf[7]&0x80) y=-y;

  return y;
}

int bspatch_apply(const char *oldPath, const char *newPath, const char *patchPath) {
  FILE * f = NULL, * cpf = NULL, * dpf = NULL, * epf = NULL;
  BZFILE * cpfbz2 = NULL, * dpfbz2 = NULL, * epfbz2 = NULL;
  int cbz2err, dbz2err, ebz2err;
  int fd = -1;
  ssize_t oldsize,newsize;
  ssize_t bzctrllen,bzdatalen;
  u_char header[32],buf[8];
  u_char *old = NULL, *new = NULL;
  off_t oldpos,newpos;
  off_t ctrl[3];
  off_t lenread;
  off_t i;
  int ret = 0;

  /*
  File format:
    0  8  "BSDIFF40"
    8  8  X
    16  8  Y
    24  8  sizeof(newfile)
    32  X  bzip2(control block)
    32+X  Y  bzip2(diff block)
    32+X+Y  ???  bzip2(extra block)
  with control block a set of triples (x,y,z) meaning "add x bytes
  from oldfile to x bytes from the diff block; copy y bytes from the
  extra block; seek forwards in oldfile by z bytes".
  */

  /* Open patch file */
  if ((f = fopen(patchPath, "rb")) == NULL) {
    ret = BSPATCH_ERR_OPEN_PATCH;
    goto cleanup;
  }

  /* Read header */
  if (fread(header, 1, 32, f) < 32) {
    ret = BSPATCH_ERR_READ_HDR;
    goto cleanup;
  }

  /* Check for appropriate magic */
  if (memcmp(header, "BSDIFF40", 8) != 0) {
    ret = BSPATCH_ERR_BAD_MAGIC;
    goto cleanup;
  }

  /* Read lengths from header */
  bzctrllen=offtin(header+8);
  bzdatalen=offtin(header+16);
  newsize=offtin(header+24);
  if((bzctrllen<0) || (bzdatalen<0) || (newsize<0)) {
    ret = BSPATCH_ERR_OVERFLOW;
    goto cleanup;
  }

  /* Close patch file and re-open it via libbzip2 at the right places */
  if (fclose(f)) {
    ret = BSPATCH_ERR_OPEN_PATCH;
    goto cleanup;
  }
  f = NULL;

  /* Open control stream */
  if ((cpf = fopen(patchPath, "rb")) == NULL) {
    ret = BSPATCH_ERR_OPEN_PATCH;
    goto cleanup;
  }
  if (fseeko(cpf, 32, SEEK_SET)) {
    ret = BSPATCH_ERR_OPEN_PATCH;
    goto cleanup;
  }
  if ((cpfbz2 = BZ2_bzReadOpen(&cbz2err, cpf, 0, 0, NULL, 0)) == NULL) {
    ret = BSPATCH_ERR_BZ2_ERROR;
    goto cleanup;
  }

  /* Open diff stream */
  if ((dpf = fopen(patchPath, "rb")) == NULL) {
    ret = BSPATCH_ERR_OPEN_PATCH;
    goto cleanup;
  }
  if (fseeko(dpf, 32 + bzctrllen, SEEK_SET)) {
    ret = BSPATCH_ERR_OPEN_PATCH;
    goto cleanup;
  }
  if ((dpfbz2 = BZ2_bzReadOpen(&dbz2err, dpf, 0, 0, NULL, 0)) == NULL) {
    ret = BSPATCH_ERR_BZ2_ERROR;
    goto cleanup;
  }

  /* Open extra stream */
  if ((epf = fopen(patchPath, "rb")) == NULL) {
    ret = BSPATCH_ERR_OPEN_PATCH;
    goto cleanup;
  }
  if (fseeko(epf, 32 + bzctrllen + bzdatalen, SEEK_SET)) {
    ret = BSPATCH_ERR_OPEN_PATCH;
    goto cleanup;
  }
  if ((epfbz2 = BZ2_bzReadOpen(&ebz2err, epf, 0, 0, NULL, 0)) == NULL) {
    ret = BSPATCH_ERR_BZ2_ERROR;
    goto cleanup;
  }

  /* Load old file into memory */
  if(((fd=open(oldPath,O_RDONLY,0))<0) ||
    ((oldsize=lseek(fd,0,SEEK_END))==-1) ||
    ((old=malloc(oldsize+1))==NULL) ||
    (lseek(fd,0,SEEK_SET)!=0) ||
    (read(fd,old,oldsize)!=oldsize) ||
    (close(fd)==-1)) {
    if (fd >= 0) close(fd);
    fd = -1;
    ret = BSPATCH_ERR_OPEN_OLD;
    goto cleanup;
  }
  fd = -1;

  /* Allocate memory for new file */
  if((new=malloc(newsize+1))==NULL) {
    ret = BSPATCH_ERR_OVERFLOW;
    goto cleanup;
  }

  oldpos=0;newpos=0;
  while(newpos<newsize) {
    /* Read control data */
    for(i=0;i<=2;i++) {
      lenread = BZ2_bzRead(&cbz2err, cpfbz2, buf, 8);
      if ((lenread < 8) || ((cbz2err != BZ_OK) &&
          (cbz2err != BZ_STREAM_END))) {
        ret = BSPATCH_ERR_READ_CTRL;
        goto cleanup;
      }
      ctrl[i]=offtin(buf);
    };

    /* Sanity-check */
    if(newpos+ctrl[0]>newsize) {
      ret = BSPATCH_ERR_OVERFLOW;
      goto cleanup;
    }

    /* Read diff string */
    lenread = BZ2_bzRead(&dbz2err, dpfbz2, new + newpos, ctrl[0]);
    if ((lenread < ctrl[0]) ||
        ((dbz2err != BZ_OK) && (dbz2err != BZ_STREAM_END))) {
      ret = BSPATCH_ERR_READ_DIFF;
      goto cleanup;
    }

    /* Add old data to diff string */
    for(i=0;i<ctrl[0];i++)
      if((oldpos+i>=0) && (oldpos+i<oldsize))
        new[newpos+i]+=old[oldpos+i];

    /* Adjust pointers */
    newpos+=ctrl[0];
    oldpos+=ctrl[0];

    /* Sanity-check */
    if(newpos+ctrl[1]>newsize) {
      ret = BSPATCH_ERR_OVERFLOW;
      goto cleanup;
    }

    /* Read extra string */
    lenread = BZ2_bzRead(&ebz2err, epfbz2, new + newpos, ctrl[1]);
    if ((lenread < ctrl[1]) ||
        ((ebz2err != BZ_OK) && (ebz2err != BZ_STREAM_END))) {
      ret = BSPATCH_ERR_READ_EXTRA;
      goto cleanup;
    }

    /* Adjust pointers */
    newpos+=ctrl[1];
    oldpos+=ctrl[2];
  };

  /* Clean up the bzip2 reads */
  BZ2_bzReadClose(&cbz2err, cpfbz2);
  cpfbz2 = NULL;
  BZ2_bzReadClose(&dbz2err, dpfbz2);
  dpfbz2 = NULL;
  BZ2_bzReadClose(&ebz2err, epfbz2);
  epfbz2 = NULL;

  /* Write the new file */
  if(((fd=open(newPath,O_CREAT|O_TRUNC|O_WRONLY,0666))<0) ||
    (write(fd,new,newsize)!=newsize) || (close(fd)==-1)) {
    if (fd >= 0) close(fd);
    fd = -1;
    ret = BSPATCH_ERR_WRITE_NEW;
    goto cleanup;
  }
  fd = -1;

  ret = 0;

cleanup:
  if (cpfbz2) BZ2_bzReadClose(&cbz2err, cpfbz2);
  if (dpfbz2) BZ2_bzReadClose(&dbz2err, dpfbz2);
  if (epfbz2) BZ2_bzReadClose(&ebz2err, epfbz2);
  if (f) fclose(f);
  if (cpf) fclose(cpf);
  if (dpf) fclose(dpf);
  if (epf) fclose(epf);
  if (fd >= 0) close(fd);
  if (new) free(new);
  if (old) free(old);

  return ret;
}
