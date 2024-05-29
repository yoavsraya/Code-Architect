const shell = require('shelljs')
const path = '/home/ec2-user/Code-Analyzer/C#';

async function csRunBuild() {
  shell.cd(path);
  console.log(process.cwd());
  console.log(shell.exec('dotnet --version'));
  const output = shell.exec('dotnet build', {silent: false});
  if (output.code !== 0) {
    console.error('Error building project:', output.stderr);
  }
};

async function csRun(projectPath) {
  shell.cd(path);
  console.log(process.cwd());
  console.log(shell.exec('dotnet --version'));
  const output = shell.exec(`dotnet run -- ${projectPath}`, {silent: false});
  if (output.code !== 0) {
    console.error('Error running project:', output.stderr);
  }
};

module.exports = {
    csRunBuild,
    csRun
};