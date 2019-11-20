var httpntlm = require("httpntlm");
const fs = require("fs-extra");
const xml2js = require("xml2js");
const path = require("path");

var prompt = require("prompt");
// This json object is used to configure what data will be retrieved from command line.
var prompt_attributes = [
  {
    // The fist input text is assigned to username variable.
    name: "username",
  },
  {
    // The second input text is assigned to password variable.
    name: "password",
    // Do not show password when user input.
    hidden: true
  }
];

/**
 *
 * CUSTOM FIELDS: MODIFY AS NEEDED
 * User and Pass are entered in console durring execution.
 *
 */
var username = "ENTER SHAREPOINT USERNAME";
var password = "ENTER SHAREPOINT PASSWORD";
const sourceDir = "\\lists";
const outDir = "\\source";

// Starts the process.
main();


async function main() {

  await promptValues().then((res) => console.log(res)).catch((err)=>console.log(err));

  const currentDirectorypath = path.join(__dirname + sourceDir);
  const outDirectoryPath = path.join(__dirname + outDir);
  var currentDirectory = fs.readdirSync(currentDirectorypath, "utf8");

  var files;
  var listName;
  var parsedDoc;

  // Process each xml file within the lists directory.
  for (let list of currentDirectory) {
    listPath = path.join(currentDirectorypath + "\\" + list);
    var parser = new xml2js.Parser();

    fs.readFile(listPath, function(err, data) {
      parser.parseString(data, function(err, result) {
        try {
          // XML structure is consistent for Sharepoint 3.0 lists, may not work for other versions!
          listName = Object.keys(result["dataroot"])[1];

          files = Object.keys(result["dataroot"][listName]);
          parsedDoc = result;

          console.log("Done parsing " + files);
        } catch (err) {
          console.error(err);
        }
      });

      console.log(parsedDoc["dataroot"][listName][files[0]]["Name"]);

      // For each object in files, parse the values needed for our getFile function.
      for (let element of files) {
        var fullName = "" + parsedDoc["dataroot"][listName][element]["Name"];
        var name = fullName.split("#")[0];
        var url = fullName.split("#")[1];
        var fullPath =
          "" + parsedDoc["dataroot"][listName][element]["URL_x0020_Path"];
        var path = fullPath.substr(0, fullPath.lastIndexOf("/") + 1);
        var isFolder = !name.includes("."); // Extremely basic "Is this a file or a folder" check.

        console.log(
          `File name: ${name}\nURL: ${url}\nPath: ${path}\nIs a FOLDER: ${isFolder}`
        );

        if (!isFolder) {
          Promise.resolve(getFiles(outDirectoryPath, name, url, path))
            .then((res) => console.log("Promise resolved! " + res))
            .catch(err => console.warn("Promise REJECTED!" + err));
        }
      }
    });
  }
}

/**
 *
 * @param {*} sourcePath root directory for the downloaded files
 * @param {*} name
 * @param {*} url
 * @param {*} fPath path to the file from the root, sourcePath
 */
async function getFiles(sourcePath, name, url, fPath) {
  return new Promise((resolve, reject) => {
    fs.ensureDirSync(path.join(sourcePath + "\\" + fPath));
    var filename = path.join(sourcePath + "\\" + fPath + name);
    console.log(filename);

    httpntlm.get(
      {
        url: url,
        username: username,
        password: password,
        binary: true,
        workstation: "",
        domain: ""
      },
      function(err, res) {
        if (err) {
          reject("GET error");
        } else {
          fs.writeFile(filename, res.body, function(ioErr) {
            if (ioErr) {
              console.log("File Writing Error!");
              reject("Writing Error");
            } else {
              resolve(`Success: ${filename}`);
            }
          });
        }
      }
    );
  });
}

async function promptValues() {
  // Start the prompt to read user input.
  prompt.start();

  const asyncPrompt = attributes =>
    new Promise((resolve, reject) => {
      // Prompt and get user input then display those data in console.
      prompt.get(attributes, function(err, result) {
        if (err) {
          console.log(err);
          reject('Failed.')
        } else {
          console.log("Command-line received data:");

          // Get user input from result object.
          username = result.username;
          password = result.password;
          var message =
            " Attempting download with Username : " +
            username;

          // Display user input in console log.
          resolve(message);
        }
      });
    });

  return await asyncPrompt(prompt_attributes);
}
