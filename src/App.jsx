import React, { useEffect, useState } from 'react';
import { parser } from 'mathjs';
import './App.css';

function App() {
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

    // Evaluate the command
    try {
      newCommands[selector]['cacheOutput'] = environment.evaluate(e.target.value);
    } catch (error) {
      newCommands[selector]['cacheOutput'] = e.target.value;
    }
    
    // Format the output
    switch (typeof(newCommands[selector]['cacheOutput'])) {
      case 'function':
        newCommands[selector]['cacheOutput'] = 'Function';
        break;
      case 'number':
        newCommands[selector]['cacheOutput'] = newCommands[selector]['cacheOutput'].toString();
        break;
      case 'string':
        newCommands[selector]['cacheOutput'] = `'${newCommands[selector]['cacheOutput']}'`;
        break;
      default:
        newCommands[selector]['cacheOutput'] = 'undefined';
    }
    
    if (newCommands[selector]['cacheOutput'].length > 20) {
      newCommands[selector]['cacheOutput'] = "Oversize";
    }
    else if (newCommands[selector]['cacheOutput'].length > 10) {
      newCommands[selector]['cacheOutput'] = newCommands[selector]['cacheOutput'].slice(0, 10) + '...';
    }
    else if (newCommands[selector]['cacheOutput'].length === 0) {
      newCommands[selector]['cacheOutput'] = '';
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

  // Updates selector position 
  useEffect(() => {
    if (commands.length > lastCommandsLength) {
      focusCommand(selector + 1);
    }
    else if (commands.length < lastCommandsLength) {
      focusCommand(selector - 1);
    }
    setLastCommandsLength(commands.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commands.length]);

  useEffect(() => {
  }, []);
  
  return (
    <div className="App">
      <div className="container">
        <div className="commandContainer">
          {commands.map((command, index) => (
            <div className="command" key={index} ref={command.ref}>
              <div className="commandType"> TX1 </div>
              <input className="commandInput" onKeyDown={parseKey} onFocus={() => {setSelector(index)}} value={command.command} onChange={modifyCommand} />
              <div className="commandOutput"> {command.cacheOutput} </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
