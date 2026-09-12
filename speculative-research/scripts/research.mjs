import {runMoonCli} from './lib/cli-host.mjs';
try {
  process.exitCode = (await runMoonCli('research', process.argv.slice(2), {verifyEachCall: false})).exitCode;
} catch (error) {
  console.log(JSON.stringify({ok: false, error: error.message}));
  process.exitCode = 1;
}
