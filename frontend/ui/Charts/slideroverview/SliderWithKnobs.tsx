/**
 * Smart City Münster Dashboard
 * Copyright (C) 2022 Reedu GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { ReactElement } from 'react';

interface SliderWithKnobsProps {
  name: string;
  currentValue: number;
  maximumValue: number;
  fontColorCurrent: string;
  fontColorMaximum: string;
  fontColorGeneral: string;
  colorCurrent: string;
  colorMaximum: string;
}

/**
 * Custom progress bar starting from 0
 * @param props Properties of the progress bar
 * @returns Component that renders single progress bar
 */
export function SliderWithKnobs(props: SliderWithKnobsProps): ReactElement {
  const {
    name,
    currentValue,
    maximumValue,
    fontColorCurrent,
    fontColorMaximum,
    fontColorGeneral,
    colorCurrent,
    colorMaximum,
  } = props;

  return (
    <div className="flex w-full min-h-8 mb-1.5 items-center">
      <p
        className="whitespace-nowrap m-0 mr-0 font-bold text-sm w-40 overflow-hidden text-ellipsis"
        style={{ color: fontColorGeneral }}
      >
        {name}
      </p>
      <div className="relative w-full h-8 mx-4 flex items-center">
        <div
          className="rounded h-1 w-full relative my-4"
          style={{
            backgroundColor: colorMaximum,
          }}
        >
          <div
            className="rounded h-full flex items-center justify-center"
            style={{
              width: `${(1 - currentValue / maximumValue) * 100}%`,
              transition: '1s ease',
              backgroundColor: colorCurrent,
              color: fontColorCurrent,
              fontSize: '12px',
            }}
          ></div>
        </div>
        <div
          className="absolute w-full flex"
          style={{ top: '50%', transform: 'translateY(-50%)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex justify-center items-center absolute right-0 mr-[-1rem] mt-[-1rem]"
            style={{
              color: fontColorMaximum,
              backgroundColor: colorMaximum,
              fontSize: '12px',
            }}
          >
            <span>{maximumValue}</span>
          </div>
          <div
            className="w-8 h-8 rounded-full flex justify-center items-center text-sm shadow-md absolute"
            style={{
              left: `${(1 - currentValue / maximumValue) * 100}%`,
              marginLeft: '-1rem',
              marginTop: '-1rem',
              transition: '1s ease',
              backgroundColor: colorCurrent,
              color: fontColorCurrent,
              fontSize: '12px',
            }}
          >
            <span>{maximumValue - currentValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
