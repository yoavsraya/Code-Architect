import fs from 'fs';
import path from 'path';

const parseProjectStructure = (filePath) => {
  const projectStructure = fs.readFileSync(filePath, 'utf-8');
  const lines = projectStructure.split('\n');
  const filePathMapping = {};

  let currentFolder = '';

  lines.forEach(line => {
    const folderMatch = line.match(/^Folder:\s*(.*)$/);
    const fileMatch = line.match(/^File:\s*(.*)$/);

    if (folderMatch) {
      currentFolder = folderMatch[1].trim();
    } else if (fileMatch) {
      const fileName = fileMatch[1].trim();
      filePathMapping[fileName] = currentFolder;
    }
  });

  return filePathMapping;
};

const getProjectFilePathMapping = () => {
  const projectFilePath = path.join('/home/ec2-user/Code-Architect/C#', 'ProjectParse.txt');
  return parseProjectStructure(projectFilePath);
};

export 
{
  getProjectFilePathMapping
} 
