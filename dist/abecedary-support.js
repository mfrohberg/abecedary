if(!eval && execScript) {
  execScript("null");
}

(function(window, parent) {
  window.stuffEmit = parent.stuffEmit;

  function normalizeErrorInfo(positionRegex, stackLines, index) {
    var matches = positionRegex.exec(stackLines[index]),
      line = parseInt(matches[2], 10),
      column = parseInt(matches[3], 10);

    // Rewrite stack lines
    stackLines[index] = stackLines[index].replace(positionRegex, "$1" + line +":$3")

    return {
      line: line,
      column: column,
      stack: stackLines.join('\n')
    }
  }

  window.generateStacktraceAndPosition = function(error) {
    //debugger;
    var sansParensStack = /([^\d]*)(\d+):(\d+)$/,
      parensStack = /([^\d])(\d+):(\d+)\)$/,
      normalizedErrorInfo = {},
      tokens = error.message.split(/\n\t?/),
      message = tokens.shift(),
      stack = (tokens.length > 0) ? tokens : error.stack.split(/\n/);

    if (sansParensStack.test(stack[0])) {
      normalizedErrorInfo = normalizeErrorInfo(sansParensStack, stack, 0);
    }
    // IE
    else if (error.description != undefined) {
      normalizedErrorInfo = normalizeErrorInfo(parensStack, stack, 1);
    }
    // Chrome
    else if (sansParensStack.test(stack[1])) {
      normalizedErrorInfo = normalizeErrorInfo(sansParensStack, stack, 1);
    }
    // Also Chrome, depending on where the error happened.
    else if (parensStack.test(stack[1])) {
      normalizedErrorInfo = normalizeErrorInfo(parensStack, stack, 1);
    }

    return {
      name: error.name,
      message: message,
      stack: normalizedErrorInfo.stack,
      line: normalizedErrorInfo.line,
      column: normalizedErrorInfo.column
    };
  };

  window.rethrow = function(error) {
    stuffEmit('error', generateStacktraceAndPosition(error));
  }

  stuffEmit('loaded');
})(window, window.parent)