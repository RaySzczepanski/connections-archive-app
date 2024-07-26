import '../index.css';

const getBoxStyle = (color) => {
    if (color === 0) {
        return {
            color: `rgb(255, 255, 255)`,
        };
    } else if (color === 1) {
        return {
            color: 'rgb(190, 190, 190)', // grey
        };
    } else if (color === 2) {
        return {
            color: 'rgb(255, 255, 150)', // yellow
        };
    } else if (color === 3) {
        return {
            color: 'rgb(144, 238, 144)', // green
        };
    } else if (color === 4) {
        return {
            color: 'rgb(173, 216, 230)', // blue
        };
    } else {
        return {
            color: 'rgb(177, 156, 217)', // purple
        };
    }
}

const Box = ({word, row, col, color, onClick}) => {
    const boxStyle = getBoxStyle(color);
    return (
        <div className="box" onClick={() => onClick(row, col)} style={{ backgroundColor: boxStyle.color }}>
            <span className="box-content">{word}</span>
        </div>
    );
};

export default Box;