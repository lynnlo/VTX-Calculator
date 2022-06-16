import React, { useEffect, useState } from 'react';
import { parser } from 'mathjs';
import { useSpring, animated } from 'react-spring';
import './App.css';
import './builtins.js'
import { formatOutput, evaluateCommand } from './vt1.js';

function App() {
  // #region VTX Engine
  const [commands, setCommands] = useState([{
    command: '',
    cacheOutput: '',
    suggestions: [],
    type: 'vt1',
    ref: React.createRef(),
    caret: 0
  }]);
  const [lastCommandsLength, setLastCommandsLength] = useState(1);
  const [selector, setSelector] = useState(0);
  const [environment] = useState(new parser());

  // Utility function, loads builtins
  let loadBuiltins = () => {
    for (let builtin in require('./builtins.js')) {
      environment.set(builtin, require('./builtins.js')[builtin]);
      //console.log(environment.get(builtin));
    }
  }

  // Utility function, focuses a command
  let focusCommand = (index) => {
    if (commands.length > index) {
      commands[index]['ref'].current.children[1].focus();
    }
  }

  // Handles command changes
  let modifyCommand = (e) => {
    let newCommands = [...commands];
    newCommands[selector]['command'] = e.target.value;
    newCommands[selector]['caret'] = e.target.selectionStart;

    // Evaluates command chain
    environment.clear();
    loadBuiltins();
    for (let newCommand in newCommands) {
      switch(newCommands[newCommand]['type']) {
        case 'vt1':
          newCommands = evaluateCommand(newCommands, newCommand, environment);
          newCommands = formatOutput(newCommands, newCommand);
          break;
        case 'txt':
          break;
        default:
          break;
      }
    }
    setCommands(newCommands);
  }

  // Handles keyboard inputs
  let parseKey = (e) => {
    e.stopPropagation();
    switch (e.key) {
      case 'Enter':
        let newCommand = {
          command: '',
          cacheOutput: '',
          suggestions: [],
          type: 'vt1',
          ref: React.createRef(),
          caret: 0
        };
        setCommands([...commands, newCommand]);
        break;
      case 'Backspace':
        if (commands[selector]['command'].length === 0 && selector > 0) {
          setCommands([...commands.slice(0, selector), ...commands.slice(selector + 1)]);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (selector > 0) {
          setSelector(selector - 1);
          focusCommand(selector - 1);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (selector < commands.length - 1) {
          setSelector(selector + 1);
          focusCommand(selector + 1);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (commands[selector]['suggestions'].length > 1) {
          let newCommands = [...commands];
          let sliceLength = newCommands[selector]['command'].length - newCommands[selector]['suggestions'][0].length;
          newCommands[selector]['command'] = newCommands[selector]['command'].slice(0, sliceLength);
            newCommands[selector]['command'] += newCommands[selector]['suggestions'][1];
            newCommands[selector]['suggestions'] = [];
          setCommands(newCommands);
        }
        break;
      default:
        break;
    }
  }

  let handleTypeChange = (index) => {
    let newCommands = [...commands];
    if (newCommands[index]['type'] === 'vt1') {
      newCommands[index]['type'] = 'txt';
    }
    else if (newCommands[index]['type'] === 'txt') {
      newCommands[index]['type'] = 'vt1';
    }
    setCommands(newCommands);
  }

  // #endregion
  
  // #region React Spring
  const [commandContainerStyles, setCommandContainerStyles] = useSpring(() => ({
    height: `${commands.length * 8}vh`,
  }));

  // #endregion

  // Updates on command changes
  useEffect(() => {
    if (commands.length > lastCommandsLength) {
      focusCommand(selector + 1);
    }
    else if (commands.length < lastCommandsLength) {
      focusCommand(selector - 1);
    }
    setLastCommandsLength(commands.length);
    setCommandContainerStyles({
      height: `${commands.length * 8}vh`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commands.length]);

  return (
    <div className="App">
      <div className="container">
        <animated.div className="commandContainer" style={commandContainerStyles}>
          {commands.map((command, index) => (
            <div className="command" key={index} ref={command.ref}>
              <div className="commandType" onClick={() => handleTypeChange(index)}> {command.type.toUpperCase()} </div>
              <input
                className="commandInput"
                onKeyDown={parseKey}
                onKeyUp={modifyCommand}
                onKeyPress={e => e.stopPropagation()}
                onFocus={() => {setSelector(index)}}
                value={command.command}
                onChange={modifyCommand}
                spellCheck="false"
              />
              <div className="commandDisplay" onClick={e => e.target.previousSibling.focus()}>
                {command.command.slice(0, command.caret)}
                <span className={(selector === index) ? "caret" : "inactiveCaret"}></span>
                {command.command.slice(command.caret)}
                <span className="suggestions">
                  {(command.command.length > 0 && command.suggestions.length > 1) ? command.suggestions[1].slice(command.suggestions[0].length) : ''}
                </span>
              </div>
              <div className="commandOutput"> 
                {(command.type !== "txt") && command.cacheOutput}
              </div>
            </div>
          ))}
        </animated.div>
      </div>
    </div>
  );
}

export default App;
