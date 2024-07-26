import '../index.css';
import Box from './Box';
import RadioBtns from './ColorRadioGroups.jsx';
import TempBox from './DisappearingText.jsx';
import { useState, useEffect, useCallback, useMemo } from 'react';

const Board = ({onGameChange}) => {
    const [data, setData] = useState(null);
    const [id, setId] = useState('411');
    const [words, setWords] = useState(Array(16).fill([null, 0]));
    const [groupNames, setGroupNames] = useState([]);
    const [remainingGroups, setRemainingGroups] = useState([]);
    const [customColorState, setCustomColorState] = useState({
        yellow: 0,
        green: 0,
        blue: 0,
        purple: 0
    });
    const [customData, setCustomData] = useState(null);
    const [setSelected, setSetSelected] = useState(new Set([]));
    const [numCorrect, setNumCorrect] = useState(0);
    const [colorsLeft, setColorsLeft] = useState([]);
    const [pulledFrom, setPulledFrom] = useState(new Set(["411"]));
    const [displayText, setDisplayText] = useState("");
    const [textKey, setTextKey] = useState(0);

    const handleCustomColors = useCallback((newColorState) => {
        setCustomColorState(newColorState);
    }, []);

    const updateGameState = useCallback(() => {
        const newState = {
            title: "Connections " + (id === '0' ? "Custom" : id)
        };
        onGameChange(newState);
        setSetSelected(new Set([]));
        setNumCorrect(0);
        setGroupNames([]);
        setDisplayText("Select four words that have a connection");
        setTextKey(prev => prev + 1);
    }, [id, onGameChange]);

    const shuffleArray = useCallback((array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }, []);

    const transformPuzzleData = useCallback((puzzleData) => {
        if (!puzzleData) return [];
        const initialWordColorPairs = Object.values(puzzleData).flatMap(group => 
            group[1].split('/').map(word => [word, 0])
        );
        return shuffleArray(initialWordColorPairs);
    }, [shuffleArray]);

    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/data.json`)
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    useEffect(() => {
        if (!data) return;
        
        const puzzleData = id !== '0' ? data[id] : customData;
        if (puzzleData) {
            setWords(transformPuzzleData(puzzleData));
            setColorsLeft(Object.keys(puzzleData));
            setRemainingGroups(Object.values(puzzleData).map(group => group[0]));
            updateGameState();
        }
    }, [data, id, customData, updateGameState, transformPuzzleData]);

    const handleClick = useCallback((r, c) => {
        if (r * 4 + c < numCorrect) return;

        const newWords = words.slice();
        const selectedWord = newWords[r * 4 + c][0];
        const newSet = new Set(setSelected);
        if (setSelected.size < 4) {
            if (words[r * 4 + c][1] === 0) {
                newSet.add(selectedWord);
                newWords[r * 4 + c][1] = 1;
            } else {
                newSet.delete(selectedWord);
                newWords[r * 4 + c][1] = 0;
            }
        } else {
            if (words[r * 4 + c][1] === 1) {
                newSet.delete(selectedWord);
                newWords[r * 4 + c][1] = 0;
            }
        }
        setSetSelected(newSet);
        setWords(newWords);
    }, [words, numCorrect, setSelected]);

    const createBoard = useMemo(() => {
        let grid = [];
        for (let r = 0; r < 4; r++) {
            let row = [];
            let isRowConnected = true;
            let rowColor = null;
            
            for (let c = 0; c < 4; c++) {
                const [word, color] = words[r * 4 + c];
                
                if (rowColor === null) {
                    rowColor = color > 1 ? color : null;
                } else if (color !== rowColor || color <= 1) {
                    isRowConnected = false;
                }
                
                row.push(
                    <Box 
                        key={`${r}-${c}`} 
                        word={word} 
                        color={color} 
                        row={r} 
                        col={c} 
                        onClick={handleClick} 
                    />
                );
            }
            
            const rowClassName = `board-row ${isRowConnected && rowColor ? 'connected' : ''}`;
            
            grid.push(
                <div key={r} className={rowClassName}>
                    {row}
                    <div className="inner-container">
                        <span className="centered-label">{groupNames[r] || null}</span>
                    </div>
                </div>
            );
        }
        return grid;
    }, [words, groupNames, handleClick]);

    const getColorId = useCallback((color) => {
        const colorMap = { yellow: 2, green: 3, blue: 4, purple: 5 };
        if (id === '0') {
            return colorMap[color.substring(0, color.length-1)] || 5;
        }
        return colorMap[color] || 5;
    }, [id]);

    const handleCheck = useCallback(() => {
        if (setSelected.size !== 4) return;
        if (numCorrect === 12) {
            // Handle last group
            setNumCorrect(16);
            setSetSelected(new Set([]));
            const colorId = getColorId(colorsLeft[0]);
            setWords(prev => prev.map((word, i) => i >= 12 ? [word[0], colorId] : word));
            setGroupNames(prev => [...prev, remainingGroups[0]]);
            setDisplayText("Good Job!");
            setTextKey(prev => prev + 1);
            return;
        }
    
        const currentData = id !== '0' ? data[id] : customData;
        let correctGroup = null;
        let counter;
        for (let [color, group] of Object.entries(currentData)) {
            const groupWords = new Set(group[1].split('/'));
            counter = 0;
            for (let elem of setSelected) {
                if (groupWords.has(elem)) {
                    counter++;
                    if (counter === 4) {
                        correctGroup = { [color]: group };
                        break;
                    }
                }
            }
            if (counter > 1) {  // 2,or 3 right = Incorrect, also breaks out of outer loop on 4, keep loop going on 1 in case of one away
                break;
            }
        }
    
        if (correctGroup) {
            const [color, [groupName, wordsString]] = Object.entries(correctGroup)[0];
            const correctWords = wordsString.split('/');
            const colorId = getColorId(color);
    
            setWords(prev => {
                const newWords = prev.filter(([word]) => !correctWords.includes(word));
                return [
                    ...newWords.slice(0, numCorrect),
                    ...correctWords.map(word => [word, colorId]),
                    ...newWords.slice(numCorrect)
                ];
            });
    
            setNumCorrect(prev => prev + 4);
            setSetSelected(new Set([]));
            setColorsLeft(prev => prev.filter(c => c !== color));
            setRemainingGroups(prev => prev.filter(g => g !== groupName));
            setGroupNames(prev => [...prev, groupName]);
            setDisplayText("Correct!");
        } else {
            setDisplayText(counter === 3 ? "One Away ..." : "Incorrect");
        }
        setTextKey(prev => prev + 1);
    }, [setSelected, numCorrect, id, data, customData, colorsLeft, remainingGroups, getColorId]);

    const handleNewClassicGame = useCallback(() => {
        if (!data) return;

        setPulledFrom(prev => {
            const newSet = new Set(prev);
            if (newSet.size > 120) newSet.clear();

            let randomPuzzle;
            const puzzleIds = Object.keys(data);
            do {
                randomPuzzle = puzzleIds[Math.floor(Math.random() * puzzleIds.length)];
            } while (newSet.has(randomPuzzle));

            newSet.add(randomPuzzle);
            setId(randomPuzzle);
            return newSet;
        });
    }, [data]);

    const handleShuffle = useCallback((x) => {
        setWords(prevWords => {
            const firstPart = prevWords.slice(0, x);
            const restPart = prevWords.slice(x);
            return [...firstPart, ...shuffleArray(restPart)];
        });
    }, [shuffleArray]);

    const handleCustomGame = () => {
        if (pulledFrom.size > 120) {
            setPulledFrom(new Set([]));
        }
        const sum = customColorState.purple + customColorState.blue + customColorState.green + customColorState.yellow;
        if (sum !== 4) {
            setDisplayText("Invalid Custom Selection - the sum must be four");
            setTextKey(prev => prev+1);
            return;
        }
        const colors = [customColorState.yellow, customColorState.green, customColorState.blue, customColorState.purple];
        const colorNames = ["yellow", "green", "blue", "purple"];
        let newPuzzleData = [];
        let cIdx = 0;
        const newSet = new Set(pulledFrom);
        var puzzleIds = Object.keys(data);
        for (let i = 0; i < 4; i++) {
            var randomPuzzle = puzzleIds[Math.floor(Math.random() * puzzleIds.length)];
            while (colors[cIdx] === 0 && cIdx <= 2) { // goto next valid color
                cIdx++;
            }
            if (newSet.has(randomPuzzle)) { // make sure I don't pull from the same classic game
                i--;
            } else {
                colors[cIdx]--;
                newPuzzleData.push([colorNames[cIdx],data[randomPuzzle][colorNames[cIdx]]]);
                newSet.add(randomPuzzle);
            }
        }
        setPulledFrom(newSet);
        const puzzleData = {
            [newPuzzleData[0][0]+"1"]: newPuzzleData[0][1], // must incude numbers or else there could be duplicate keys
            [newPuzzleData[1][0]+"2"]: newPuzzleData[1][1],
            [newPuzzleData[2][0]+"3"]: newPuzzleData[2][1],
            [newPuzzleData[3][0]+"4"]: newPuzzleData[3][1]
        }
        setCustomData(puzzleData);
        setId('0');
        
    }

    return (
        <>
            <div className="game-container">{createBoard}</div>
            <div className="text-row">
                <TempBox text={displayText} keyProp={textKey}/>
            </div>
            <div className="controls-container">
                <div>
                    <div className="board-row">
                        <button onClick={() => handleShuffle(numCorrect)} disabled={numCorrect === 16}>Shuffle</button>
                        <button onClick={handleCheck} disabled={setSelected.size !== 4}>Check Answer</button>
                    </div>
                    <RadioBtns onCustomColors={handleCustomColors}/>
                    <div className="board-row">
                        <button onClick={handleCustomGame}>New Custom Game</button>
                        <button onClick={handleNewClassicGame}>New Classic Game</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Board;