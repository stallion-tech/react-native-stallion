export const getMonth = (monthNum: number) => {
  switch (monthNum) {
    case 0:
      return 'Jan';
    case 1:
      return 'Feb';
    case 2:
      return 'Mar';
    case 3:
      return 'Apr';
    case 4:
      return 'May';
    case 5:
      return 'Jun';
    case 6:
      return 'Jul';
    case 7:
      return 'Aug';
    case 8:
      return 'Sep';
    case 9:
      return 'Oct';
    case 10:
      return 'Nov';
    case 11:
      return 'Dec';
    default:
      return 'Jan';
  }
};
export const parseDateTime = (dateStr: string): string => {
  const parsedDate = new Date(dateStr);
  const date = parsedDate.getDate();
  const monthNum = parsedDate.getMonth();
  const month = getMonth(monthNum);
  const year = parsedDate.getFullYear();
  return `${date} ${month} ${year}`;
};
