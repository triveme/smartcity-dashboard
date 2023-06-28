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
import { Box, Typography } from '@mui/material';
import { Suspense } from 'react';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';
import colors from 'theme/colors';

interface SliderProps {
  name: string,
  currentValue: number,
  maximumValue: number
}
interface SliderBasicProps {
  name: string,
  currentValue: number,
  unit: string
}

interface SliderBarProps {
  value: number;
}

const ProgressComponentWrapper = styled.div`
  display: flex;
  width: 100%;
  min-height: 32px; // this is a safari fix
  margin-bottom: 0.3rem;
  align-items: center;
`;

const Title = styled.p`
  color: ${colors.white};
  white-space: nowrap;
  margin: 0;
  margin-right: 0rem;
  font-weight: bold;
  font-size: smaller;
  width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ProgressWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 2rem;
  margin: 0 1rem;
  display: flex;
  align-items: center;
`;

const ProgressBar = styled.div`
  background-color: ${colors.attributeColors[1]};
  border-radius: 3px;
  position: relative;
  margin: 1rem 0;
  height: 3px;
  width: 100%;
`;

const ProgressKnobs = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
`;

const ProgressKnob = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${colors.primary};
  font-size: smaller;
  box-shadow: var(--scms-box-shadow-small);
  font-weight: var(--scms-semi-bold);
  &:hover {
    z-index: 10;
  }
`;

const ProgressKnobHidden = styled(ProgressKnob)`
  visibility: hidden;
`;

const ProgressStatus = styled(ProgressKnob)<SliderBarProps>`
  background-color: ${colors.attributeColors[0]};
  position: absolute;
  margin-left: -1rem;
  left: ${(props) => `${props.value}%` || '0%'};
  transition: 1s ease;
`;

const ProgressEnd = styled(ProgressKnob)`
  background-color: ${colors.attributeColors[1]};
  position: absolute;
  right: 0;
  margin-right: -1rem;
`;

const ProgressDone = styled.div<SliderBarProps>`
  background: ${colors.attributeColors[0]};
  border-radius: 3px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: ${(props) => `${props.value}%` || '0%'};
  transition: 1s ease;
`;

/**
 * Custom progress bar starting from 0
 * @param props Properties of the progress bar
 * @returns Component that renders single progress bar
 */
export function SliderWithKnobs(props: SliderProps) {
  const { name, currentValue, maximumValue } = props;

  return(
    <ProgressComponentWrapper>
      <Title>{name}</Title>
      <ProgressWrapper>
        {/* This is the horizontal line displaying the progress */}
        <ProgressBar>
          <ProgressDone
              value={(1 - currentValue / maximumValue) * 100}
          ></ProgressDone>
        </ProgressBar>
        {/* Here are the knobs / buttons in the progress bar */}
        <ProgressKnobs>
          <Suspense fallback={<Skeleton></Skeleton>}>
            {/* We need this knob for correct layout idk */}
            <ProgressKnobHidden></ProgressKnobHidden>
            {/* This is the square knob at the start */}
            {/* <ProgressStart>{(info.maxValue - info.currentlyUsed)}</ProgressStart> */}
            {/* This is the circular knob at the end */}
            <ProgressEnd>
              <span>{maximumValue}</span>
            </ProgressEnd>
            {/* This is the circular knob sliding in the progress bar */}
            <ProgressStatus
              value={(1 - currentValue / maximumValue) * 100}
            >
              <span>{(maximumValue - currentValue)}</span>
            </ProgressStatus>
          </Suspense>
        </ProgressKnobs>
      </ProgressWrapper>
    </ProgressComponentWrapper>
  );
}

/**
 * Custom progress bar starting from 0
 * @param props Properties of the progress bar
 * @returns Component that renders single progress bar
 */
export function SliderWithoutKnobs(props: SliderBasicProps) {
  const { name, currentValue, unit } = props;

  return(
    <Box
      display="flex"
      flexDirection="row"
      width="100%"
    >
      <Box
        width="100%"
        flexBasis="90%"
      >
        <ProgressComponentWrapper>
          <Title>{name}</Title>
          <ProgressWrapper>
            {/* This is the horizontal line displaying the progress */}
            <ProgressBar>
              <ProgressDone
                  value={currentValue}
              ></ProgressDone>
            </ProgressBar>
          </ProgressWrapper>
        </ProgressComponentWrapper>
      </Box>
      <Box
        display={"flex"}
        flexDirection={"row"}
        flexWrap={"nowrap"}
        justifyContent="center"
        alignItems="center"
        flexBasis="10%"
      >
        <Typography color={colors.iconColor}>{currentValue}</Typography>
        <Typography color={colors.white}>&nbsp;{unit}</Typography>
      </Box>
    </Box>
  );
}