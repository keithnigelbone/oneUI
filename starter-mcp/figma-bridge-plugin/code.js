// OneUI Figma Bridge — plugin main thread.
//
// This is the OneUI-owned counterpart to the figma-console Desktop Bridge. Its
// ONLY job is to run the snippet that oneui-mcp's `figma_to_code` builds
// (`buildModesSnippet`) — which reads per-node `resolvedVariableModes` and
// bound dimension-variable names. That data is Plugin-API-only: no Figma REST
// and no official Dev-Mode MCP can supply it, so a Plugin-API bridge is
// mandatory. `enablePrivatePluginApi: true` (in manifest) unlocks
// `resolvedVariableModes`.
//
// The plugin sandbox can't open a WebSocket directly, so the visible UI iframe
// (ui.html) holds the socket to the oneui-mcp server and relays messages here
// via postMessage. We execute relayed code with `eval` of an async IIFE — the
// AsyncFunction constructor is blocked in Figma's sandbox, but `eval` works.

figma.showUI(__html__, { width: 300, height: 168, title: 'OneUI Bridge' });

function fileInfo() {
  return { fileName: figma.root.name, fileKey: figma.fileKey || null };
}

// Announce identity so the UI can report the open file to the server on connect.
figma.ui.postMessage({ type: 'PLUGIN_READY', fileInfo: fileInfo() });
try {
  figma.on('currentpagechange', function () {
    figma.ui.postMessage({ type: 'FILE_INFO', fileInfo: fileInfo() });
  });
} catch (e) {
  /* older API — ignore */
}

figma.ui.onmessage = async function (msg) {
  if (!msg || msg.type !== 'EXECUTE_CODE') return;
  var requestId = msg.requestId;

  try {
    // Wrap user code in an async IIFE so `await` works under `eval`.
    var wrapped = '(async function() {\n' + msg.code + '\n})()';
    var timeoutMs = msg.timeout || 30000;
    var timeoutPromise = new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error('Execution timed out after ' + timeoutMs + 'ms'));
      }, timeoutMs);
    });

    var codePromise;
    try {
      codePromise = eval(wrapped); // returns the IIFE's Promise
    } catch (syntaxError) {
      var sMsg = syntaxError && syntaxError.message ? syntaxError.message : String(syntaxError);
      figma.ui.postMessage({
        type: 'EXECUTE_CODE_RESULT',
        requestId: requestId,
        success: false,
        error: 'Syntax error: ' + sMsg,
      });
      return;
    }

    var result = await Promise.race([codePromise, timeoutPromise]);
    figma.ui.postMessage({
      type: 'EXECUTE_CODE_RESULT',
      requestId: requestId,
      success: true,
      result: result,
      fileInfo: fileInfo(),
    });
  } catch (error) {
    var name = error && error.name ? error.name : 'Error';
    var eMsg = error && error.message ? error.message : String(error);
    figma.ui.postMessage({
      type: 'EXECUTE_CODE_RESULT',
      requestId: requestId,
      success: false,
      error: name + ': ' + eMsg,
    });
  }
};
