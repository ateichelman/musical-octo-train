# Sharepoint-To-Confluence Tools

Simple set of scripts, created to pull data from an actual artifact (it belongs in a museum) and put into a modern Confluence site.

## Installation

1. clone
2. npm install

## Usage

### Retrieve XML Lists

To download the files from Sharepoint, we first need to get the lists as xml files. One way to do this is to import the sharepoint site in access, and convert each table into an xml list.

1. Create a new Microsoft Access Database.
2. Under the External Data tab select New Data Source -> Online Services -> Sharepoint List
3. Enter the site url into the prompt, click next, and then enter your credentials.
4. Select the lists and click Ok.
5. Select each table, and under the External Data tab select the XML File export.
6. Place these exported XML files in the lists folder in the project directory.

### Download Files from Sharepoint

You can start the download process with:
```
npm start
```

You'll be prompted to enter your username and password.

Once the download is complete, you can find the files under the source directory.

### Upload to Confluence

To start uploading, use:
```
npm run upload
```

You'll be prompted to enter your username, password, confluence base url (ex. https://site.attlassian.com/wiki), and the name of the space that will act as the "root directory" for the uploaded pages and documents.
