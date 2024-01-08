import React, { useEffect, useState } from "react";
import "../scss/main.scss";
import { gems, heightField, widthField } from "../../constants/constants.ts";
import { motion } from "framer-motion";

export default function Game() {
  const [started, setStarted] = useState<boolean>(false);
  const [points, setPoints] = useState<number>(0);
  const [moves, setMoves] = useState<number>(20);
  const [activeBlock, setActiveBlock] = useState<number | null>(null);
  const [arrayElements, setArrayElements] = useState<(string | null)[][]>([]);
  const [deletedElements, setDeletedElements] = useState<number[]>([]);

  //useEffect, в котором повесили слушатель события на body. В целом, нужен для того, чтобы убрать активный блок (отменить нажатие по блоку)
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

  //useEffect, создающий поле 10х10 для игры
  useEffect(() => {
    const bufferArray = [];
    for (let i = 0; i < widthField; i++) {
      const subarray = [];
      for (let j = 0; j < heightField; j++) {
        subarray.push(generateRandomBlock());
      }
      bufferArray.push(subarray);
    }
    setArrayElements(bufferArray);
  }, []);

  //useEffect, следящий за кол-вом ходов, если ходов не осталось, заканчиваем игру
  useEffect(() => {
    if (moves === 0) {
      setTimeout(end, 1000);
    }
  }, [moves]);

  //Функция для старта игры
  function start() {
    setStarted(true);
    setMoves(20);
    setPoints(0);
    analyze();
  }

  //Функция для окончания игры
  function end() {
    setMoves(0);
    setStarted(false);
  }

  //Функция для обработки клика по элементу (ячейке)
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

  //Функция для обработки хода игрока
  function move(currentIndex: number) {
    const bufferArray = [...arrayElements];
    if (activeBlock !== null) {
      //меняем элементы местами
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
    const deletedElements = [];
    const bufferArray = [...arrayElements];
    // Функция для проверки границ массива
    function isValid(i: number, j: number) {
      return (
        i >= 0 && i < bufferArray.length && j >= 0 && j < bufferArray[i].length
      );
    }
    // Работаем с горизонтальными комбинациями
    for (let i = 0; i < bufferArray.length; i++) {
      for (let j = 0; j < bufferArray[i].length; j++) {
        if (isValid(i, j - 1) && isValid(i, j + 1)) {
          if (
            bufferArray[i][j - 1] === bufferArray[i][j] &&
            bufferArray[i][j] === bufferArray[i][j + 1]
          ) {
            deletedElements.push(i * 10 + j - 1);
            deletedElements.push(i * 10 + j);
            deletedElements.push(i * 10 + j + 1);
          }
        }
      }
    }
    // Работаем с вертикальными комбинациями
    for (let i = 0; i < bufferArray.length; i++) {
      for (let j = 0; j < bufferArray[i].length; j++) {
        if (isValid(i - 1, j) && isValid(i + 1, j)) {
          if (
            bufferArray[i - 1][j] === bufferArray[i][j] &&
            bufferArray[i][j] === bufferArray[i + 1][j]
          ) {
            deletedElements.push((i - 1) * 10 + j);
            deletedElements.push(i * 10 + j);
            deletedElements.push((i + 1) * 10 + j);
          }
        }
      }
    }
    setDeletedElements(deletedElements);
  }

  //Функция для обработки анимации, почти целиком написана чатом-гпт, так как сам до такого я не дошёл, хотя пытался:(
  function onAnimationComplete() {
    const updatedData = [...arrayElements];
    const scoreIncrement = deletedElements.length;

    // Удаляем блоки с анимацией
    deletedElements.forEach((index) => {
      const row = Math.floor(index / 10);
      const col = index % 10;

      setTimeout(() => {
        updatedData[row][col] = null;
        setArrayElements([...updatedData]);

        if (index === deletedElements[deletedElements.length - 1]) {
          // После завершения анимации всех блоков
          setTimeout(() => {
            // Обработка "проваливающихся" блоков для каждого столбца
            for (let col = 0; col < widthField; col++) {
              const fallingBlocks = [];
              for (let row = heightField - 1; row >= 0; row--) {
                if (updatedData[row][col] !== null) {
                  fallingBlocks.push(updatedData[row][col]);
                }
              }

              // Заполняем свободные места сверху новыми блоками
              for (let row = heightField - 1, i = 0; row >= 0; row--, i++) {
                updatedData[row][col] =
                  fallingBlocks[i] || generateRandomBlock();
              }
            }

            setArrayElements(updatedData);
            setDeletedElements([]);
            analyze();
            setPoints((prevState) => prevState + scoreIncrement);
          }, 0);
        }
      }, 0);
    });
  }

  // Генерация случайного блока
  function generateRandomBlock() {
    const randomIndex = getRandomIndex(0, 5);
    return gems[randomIndex];
  }

  // Получение случайного индекса
  function getRandomIndex(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  return (
    <>
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
                if (gem) {
                  if (deletedElements.includes(currentIndex)) {
                    return (
                      <motion.div
                        className={"deletedBlock"}
                        key={currentIndex}
                        onClick={(event) => click(event, currentIndex)}
                        animate={{ opacity: 0 }}
                        onAnimationComplete={() => {
                          if (
                            currentIndex ===
                            deletedElements[deletedElements.length - 1]
                          )
                            onAnimationComplete();
                        }}
                      >
                        <img src={gem} alt="del-gem" />
                      </motion.div>
                    );
                  } else {
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
                        <img src={gem} alt="del-gem" />
                      </div>
                    );
                  }
                } else {
                  return (
                    <div className={"game-block"} key={currentIndex}>
                      <div className="empty-block"></div>
                    </div>
                  );
                }
              }),
            )}
          </div>
        </div>
      ) : moves > 0 ? (
        <div onClick={() => start()} className={"start-button"}>
          Начать игру
        </div>
      ) : (
        <div className={"game-end"}>
          <span>Игра окончена. Вы набрали {points} очков.</span>
          <div onClick={() => start()} className={"start-button"}>
            Попробовать снова
          </div>
        </div>
      )}
    </>
  );
}
