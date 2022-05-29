import React, { useEffect, useState } from 'react';
import { parser } from 'mathjs';
import { useSpring, animated } from 'react-spring';
import './App.css';

function App() {
  // #region VTX Engine
  const [commands, setCommands] = useState([{
    command: '',
    cacheOutput: '',
    ref: React.createRef()
  }]);
  const [lastCommandsLength, setLastCommandsLength] = useState(1);
  const [selector, setSelector] = useState(0);
  const [environment] = useState(new parser());

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

    // Evaluates command chain
    environment.clear();
    for (let newCommand in newCommands) {
      // Evaluate the command
      switch (newCommands[newCommand]['command']) {
        case 'clear':
          environment.clear();
          newCommands[newCommand]['cacheOutput'] = newCommands[newCommand]['command'];
          break;
        default:
          try {
            newCommands[newCommand]['cacheOutput'] = environment.evaluate(newCommands[newCommand]['command']);
          } catch (error) {
            newCommands[newCommand]['cacheOutput'] = newCommands[newCommand]['command'];
          }
          break;
      }
      
      // Format the output
      switch (typeof(newCommands[newCommand]['cacheOutput'])) {
        case 'function':
          newCommands[newCommand]['cacheOutput'] = 'Function';
          break;
        case 'number':
          newCommands[newCommand]['cacheOutput'] = newCommands[newCommand]['cacheOutput'].toString();
          break;
        case 'string':
          newCommands[newCommand]['cacheOutput'] = `${newCommands[newCommand]['cacheOutput']}`;
          break;
        default:
          newCommands[newCommand]['cacheOutput'] = '';
      }
      
      if (newCommands[newCommand]['cacheOutput'].length > 10) {
        newCommands[newCommand]['cacheOutput'] = newCommands[newCommand]['cacheOutput'].slice(0, 10) + '...';
      }
      else if (newCommands[newCommand]['cacheOutput'].length === 0) {
        newCommands[newCommand]['cacheOutput'] = '';
      }
    }
    setCommands(newCommands);
  }

  // Handles keyboard inputs
  let parseKey = (e) => {
    switch (e.key) {
      case 'Enter':
        let newCommand = {
          command: '',
          cacheOutput: '',
          ref: React.createRef()
        };
        setCommands([...commands, newCommand]);
        break;
      case 'Backspace':
        if (commands[selector]['command'].length === 0 && selector > 0) {
          setCommands([...commands.slice(0, selector), ...commands.slice(selector + 1)]);
        }
        break;
      case 'ArrowUp':
        if (selector > 0) {
          setSelector(selector - 1);
          focusCommand(selector - 1);
        }
        break;
      case 'ArrowDown':
        if (selector < commands.length - 1) {
          setSelector(selector + 1);
          focusCommand(selector + 1);
        }
        break;
      default:
        break;
    }
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
              <div className="commandType"> TX1 </div>
              <input
                className="commandInput"
                onKeyDown={parseKey}
                onFocus={() => {setSelector(index)}}
                value={command.command}
                onChange={modifyCommand}
              />
              <div className="commandOutput"> 
                {command.cacheOutput}
              </div>
            </div>
          ))}
        </animated.div>
      </div>
    </div>
  );
}

export default App;
