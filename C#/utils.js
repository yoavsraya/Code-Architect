const { exec } = require('child_process');

async function csRunBuild()
{
    exec('dotnet build', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error building project: ${error}`);
          return;
        }
                  console.log(`Build output: ${stdout}`);
})};

async function csRun(path)
{
    exec(`dotnet run -- ${path}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error building project: ${error}`);
          return;
        }
                  console.log(`Build output: ${stdout}`);
})};

module.exports = {
    csRunBuild,
    csRun
};
