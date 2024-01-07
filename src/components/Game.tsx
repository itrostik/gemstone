import React, { useEffect, useState } from "react";
import "../scss/main.scss";
import { gems, heightField, widthField } from "../../constants/constants.ts";

export default function Game() {
  const [started, setStarted] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [moves, setMoves] = useState<number>(20);
  const [activeBlock, setActiveBlock] = useState<number | null>(null);
  const [arrayElements, setArrayElements] = useState<string[][]>([]);

  useEffect(() => {
    document.body.addEventListener("click", () => {
      setActiveBlock(null);
    });
    return () => {
      document.body.removeEventListener("click", () => {
        setActiveBlock(null);
      });
    };
  }, []);
  useEffect(() => {
    const bufferArray = [];
    for (let i = 0; i < widthField; i++) {
      const subarray = [];
      for (let j = 0; j < heightField; j++) {
        const randomIndex = getRandomIndex(0, 5);
        subarray.push(gems[randomIndex]);
      }
      bufferArray.push(subarray);
    }
    setArrayElements(bufferArray);
  }, []);

  function start() {
    setStarted(true);
  }

  function click(event: React.MouseEvent<HTMLDivElement>, index: number) {
    event.stopPropagation();
    if (
      activeBlock !== null &&
      [index + 1, index - 1, index + heightField, index - heightField].includes(
        activeBlock,
      )
    ) {
      move(index);
    } else setActiveBlock(index);
  }

  function move(currentIndex: number) {
    const bufferArray = arrayElements;
    if (activeBlock !== null) {
      //меняю элементы местами
      const firstElementFirstIndex = Math.floor(activeBlock / 10);
      const secondElementFirstIndex = Math.floor(currentIndex / 10);
      const firstElementSecondIndex = activeBlock % 10;
      const secondElementSecondIndex = currentIndex % 10;
      [
        [[bufferArray[firstElementFirstIndex][firstElementSecondIndex]]],
        [[bufferArray[secondElementFirstIndex][secondElementSecondIndex]]],
      ] = [
        [[bufferArray[secondElementFirstIndex][secondElementSecondIndex]]],
        [[bufferArray[firstElementFirstIndex][firstElementSecondIndex]]],
      ];
      setArrayElements(bufferArray);
      setActiveBlock(null);
      setMoves((prevState) => prevState - 1);
      analyze();
    }
  }

  function analyze() {
    const combination = "";
    const currentElement = null;
    const bufferArray = arrayElements;
    for (let i = 0; i < bufferArray.length; i++) {
      for (let j = 0; j < bufferArray.length; j++) {
        if (
          bufferArray[i][j - 1] !== null &&
          bufferArray[i][j - 1] === bufferArray[i][j] &&
          bufferArray[i][j] === bufferArray[i][j + 1]
        ) {
          bufferArray[i][j - 1] =
            bufferArray[i][j] =
            bufferArray[i][j + 1] =
              "";
        }
        if (
          bufferArray[i - 1][j] === bufferArray[i][j] &&
          bufferArray[i][j] === bufferArray[i + 1][j]
        ) {
          bufferArray[i - 1][j] =
            bufferArray[i][j] =
            bufferArray[i + 1][j] =
              "";
        }
      }
    }
  }

  function getRandomIndex(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  return (
    <div>
      {started ? (
        <div>
          <div className="game-info">
            <div>Ваши очки: {points}</div>
            <div>Осталось ходов: {moves}</div>
          </div>
          <div className={"game-container"}>
            {arrayElements.map((item, index1) =>
              item.map((gem, index2) => {
                const currentIndex = 10 * index1 + index2;
                return (
                  <div
                    className={
                      activeBlock === currentIndex
                        ? "game-block " + "game-active-block"
                        : "game-block"
                    }
                    key={currentIndex}
                    onClick={(event) => click(event, currentIndex)}
                  >
                    <img src={gem} alt="" />
                  </div>
                );
              }),
            )}
          </div>
        </div>
      ) : (
        <div onClick={() => start()} className={"start-button"}>
          Начать игру
        </div>
      )}
    </div>
  );
}
