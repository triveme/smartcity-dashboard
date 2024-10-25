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

interface SliderWithoutKnobsProps {
  name: string;
  currentValue: number;
  unit: string;
}

/**
 * Custom progress bar starting from 0
 * @param props Properties of the progress bar
 * @returns Component that renders single progress bar
 */
export function SliderWithoutKnobs(
  props: SliderWithoutKnobsProps,
): ReactElement {
  const { name, currentValue, unit } = props;

  return (
    <div className="flex w-full">
      <div className="w-full flex-1">
        <div className="flex w-full min-h-8 mb-1.5 items-center">
          <p className="text-white whitespace-nowrap m-0 mr-0 font-bold text-sm w-40 overflow-hidden text-ellipsis">
            {name}
          </p>
          <div className="relative w-full h-8 mx-4 flex items-center">
            <div className="bg-gray-800 rounded h-1 w-full relative my-4">
              <div
                className="bg-red-600 rounded h-full flex items-center justify-center text-white"
                style={{ width: `${currentValue}%`, transition: '1s ease' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row flex-nowrap justify-center items-center flex-none">
        <p className="text-gray-400">{currentValue}</p>
        <p className="text-white">&nbsp;{unit}</p>
      </div>
    </div>
  );
}
