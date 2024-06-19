const { execSync } = require('child_process');
const path = require('path');
const targetDirectory = path.join('/home/ec2-user/Code-Analyzer/C#');

// Function to build the .NET project
async function csRunBuild() {
  execSync('dotnet build', (error, stdout, stderr) => {
        if (error) {
            console.error(`Build error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Build stderr: ${stderr}`);
            return;
        }
        console.log(`Build stdout: ${stdout}`);
    });
    console.log("END csRunBuild function")

}

// Function to run the .NET project
async function csRun(projectPath) {
  execSync('dotnet run -- /home/ec2-user/Code-Analyzer/UserFiles', (error, stdout, stderr) => {
        if (error) {
            console.error(`Run error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Run stderr: ${stderr}`);
            return;
        }
        console.log(`Run stdout: ${stdout}`);
    });
    console.log("END csRun function")

}

module.exports = {
    csRunBuild,
    csRun
};
