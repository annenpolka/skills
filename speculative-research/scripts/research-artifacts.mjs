import {runMoonCli} from './lib/cli-host.mjs';
try {
  process.exitCode = (await runMoonCli('research-artifacts', process.argv.slice(2), {verifyEachCall: false})).exitCode;
} catch (error) {
  console.log(JSON.stringify({ok: false, errors: [{code: 'host_error', message: error.message}]}));
  process.exitCode = 1;
}
