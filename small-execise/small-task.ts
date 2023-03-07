
import * as fs from 'fs';
import * as path from 'path';


// transforms array to containing number and strings.
function transformArray(arr: (string | number)[]): (string | number)[] {
  return arr.map((elem) =>
    typeof elem === "string"
      ? isNaN(Number(elem))
        ? elem
        : Number(elem)
      : elem
  );
}

// a function to return an array of all files with  csv  extension in folder  ../recruitment-node-template-main/files
function getCSVFilesInFolder(folderPath: string): string[] {
  const csvFiles: string[] = [];

  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);
    const fileExt = path.extname(filePath);

    if (fs.statSync(filePath).isFile() && fileExt === ".csv") {
      csvFiles.push(filePath);
    } else if (fs.statSync(filePath).isDirectory()) {
      csvFiles.push(...getCSVFilesInFolder(filePath));
    }
  });

  return csvFiles;
}

// a function to return if a string contains a digit
function hasDigit(str: string): boolean {
  return /\d/.test(str);
}



console.log(transformArray(["super", "20.567", "test", 23 ]))
console.log(getCSVFilesInFolder("./files"));
console.log(hasDigit("'test-string23'"));
