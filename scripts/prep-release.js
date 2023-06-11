const fs = require('fs/promises');
const path = require('path');
const rimraf = require('rimraf');
const prettier = require('prettier');

const rootPath = path.resolve(__dirname, '../', 'sdk-package');
const commonJsModulePath = path.resolve(__dirname, '../', 'lib/commonjs');
const androidModulePath = path.resolve(__dirname, '../', 'android');
const iosModulePath = path.resolve(__dirname, '../', 'ios');
const typesPath = path.resolve(__dirname, '../', 'lib/typescript');
const pkgJsonPath = path.resolve(__dirname, '../', 'package.json');
async function prepRelease() {
  try {
    //create package dir
    await fs.mkdir(rootPath);

    //copy commonjs dir to package root
    await fs.cp(commonJsModulePath, `${rootPath}/src`, { recursive: true });

    //copy types dir to package types
    await fs.cp(typesPath, `${rootPath}/types/`, { recursive: true });

    //copy types dir to package types
    await fs.cp(androidModulePath, `${rootPath}/android/`, { recursive: true });

    //copy types dir to package types
    await fs.cp(iosModulePath, `${rootPath}/ios/`, { recursive: true });

    // copy package.json to package root
    await fs.copyFile(pkgJsonPath, `${rootPath}/package.json`);
    const file = require(`${rootPath}/package.json`);
    delete file.devDependencies;
    delete file['react-native-builder-bob'];
    delete file.prettier;
    delete file.files;
    delete file.engines;
    delete file.packageManager;
    delete file.commitlint;
    delete file.eslintConfig;
    delete file.eslintIgnore;
    delete file.scripts;

    await fs.writeFile(
      `${rootPath}/package.json`,
      prettier.format(JSON.stringify(file), { parser: 'json' })
    );
    console.log('Success');
  } catch (e) {
    await deleteRoot();
    console.error(e.toString());
  }
}

async function deleteRoot() {
  try {
    rimraf.sync(rootPath);
  } catch (e) {
    throw new Error(e.toString());
  }
}

prepRelease();
