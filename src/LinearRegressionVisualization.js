import React, { Component } from 'react';
import { ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Text } from 'recharts';
import { CustomVisualization, DEFAULT_COLOR_PALETTE } from './CustomVisualization';
import { Regression } from 'smr';

import { get, unzip, range } from 'lodash';
import { immutableSet } from './utils';

export function getData(props, executionResult) {
  const executionData = get(executionResult, 'data', []);
  const barCount = executionData.length;
  const data = unzip(executionData).map( (pointArray, valueIndex) => {
    const pointObject = {
      label: get(executionResult, `headerItems[1][0][${valueIndex}].attributeHeaderItem.name`)
    };
    pointArray.forEach( (pointItem, pointItemIndex) => (
      pointObject[pointItemIndex] = parseFloat(pointItem)
    ) );

    return pointObject;
  } );

  console.log('data', data);

  return data;
}

export function getContent(props, executionResult, data) {
  const executionData = get(executionResult, 'data', []);
  const barCount = executionData.length;

  const formatterMap = {
    5: (value) => (Math.round(value * 10000) / 100 + ' %')
  };

  const bars = range(barCount).map( pointIndex => (
    <Bar
      key={pointIndex}
      name={ get(executionResult, `headerItems[0][0][${pointIndex}].measureHeaderItem.name`) }
      dataKey={pointIndex}
      fill={DEFAULT_COLOR_PALETTE[pointIndex]}
      label={{ fill: DEFAULT_COLOR_PALETTE[pointIndex], fontSize: 10, position: 'top', formatter: formatterMap[pointIndex]}}
    />
  ) );

  return (<BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="label" />
    <YAxis />
    {bars}
    <Legend />
  </BarChart>);
}

export function updateExecutionResult(executionResult, props) {
  console.log('executionResult', executionResult);

  const predictionSize = 5;

  const updatedExecutionResult = {
    ...executionResult,
    data: [
      executionResult.data[0],
      executionResult.data[1],
      executionResult.data[2],
    ]
  };
  const trainingData = updatedExecutionResult.data[2].slice(0, -predictionSize);
  console.log('trainingData', trainingData);

  if (props.stage === 1) {
    // fill with empty data
    const predictedData = range(predictionSize).fill(null);
    updatedExecutionResult.data[2] = trainingData.concat(predictedData);
  }

  if (props.stage === 2) {
    // init linear regression based on single column (Active Users)
    const regression = new Regression({ numX: 1, numY: 1});

    // push training data
    trainingData.map( (dataPoint, dataPointIndex) => {
      regression.push({ x: [executionResult.data[0][dataPointIndex]], y: [dataPoint] });
    } );

    // calculate coeficients
    console.log('Regression coeficients', regression.calculateCoefficients());

    // predict data
    const predictedData = updatedExecutionResult.data[0].map( (sourceValue, predictionIndex) => {
      const dataPointIndex = trainingData.length + predictionIndex;
      const prediction = regression.hypothesize({ x: [sourceValue] })[0];
      console.log('prediction for', sourceValue, ':', prediction);
      return Math.round(prediction).toString(10);
    } );

    const mergedData = predictedData;
    const originalData = executionResult.data[2];
    console.log('originalData', originalData);

    // add original data, absolute and relative error values
    updatedExecutionResult.data[3] = predictedData;
    updatedExecutionResult.data[4] = mergedData.map( (pointValue, pointIndex) => Math.abs(originalData[pointIndex] - pointValue).toString(10) );
    updatedExecutionResult.data[5] = mergedData.map( (pointValue, pointIndex) => (Math.abs(originalData[pointIndex] - pointValue) / originalData[pointIndex]).toString(10) );
    updatedExecutionResult.headerItems[0][0][2] = { measureHeaderItem: { name: 'Unique Dashboard Views (original)' } };
    updatedExecutionResult.headerItems[0][0][3] = { measureHeaderItem: { name: 'Unique Dashboard Views (predicted)' } };
    updatedExecutionResult.headerItems[0][0][4] = { measureHeaderItem: { name: 'Absolute error' } };
    updatedExecutionResult.headerItems[0][0][5] = { measureHeaderItem: { name: 'Relative error' } };
  }

  if (props.stage === 3) {
    // init linear regression based on multiple columns (Active Users and Tab Views)
    const regression = new Regression({ numX: 2, numY: 1});

    // push training data
    trainingData.map( (dataPoint, dataPointIndex) => {
      regression.push({ x: [executionResult.data[0][dataPointIndex], executionResult.data[1][dataPointIndex]], y: [dataPoint] });
    } );

    // calculate coeficients
    console.log('Regression coeficients', regression.calculateCoefficients());

    // predict data
    const predictedData = executionResult.data[0].map( (sourceValueCol1, predictionIndex) => {
      const dataPointIndex = predictionIndex;
      const sourceValueCol2 = executionResult.data[1][dataPointIndex];
      const prediction = regression.hypothesize({ x: [sourceValueCol1, sourceValueCol2] })[0];
      console.log('prediction for', sourceValueCol1, 'and', sourceValueCol2, ':', prediction);
      return Math.round(prediction).toString(10);
    } );

    const mergedData = predictedData;
    const originalData = executionResult.data[2];
    console.log('originalData', originalData);

    // add original data, absolute and relative error values
    updatedExecutionResult.data[3] = mergedData;
    updatedExecutionResult.data[4] = mergedData.map( (pointValue, pointIndex) => Math.abs(originalData[pointIndex] - pointValue).toString(10) );
    updatedExecutionResult.data[5] = mergedData.map( (pointValue, pointIndex) => (Math.abs(originalData[pointIndex] - pointValue) / originalData[pointIndex]).toString(10) );
    updatedExecutionResult.headerItems[0][0][2] = { measureHeaderItem: { name: 'Unique Dashboard Views (original)' } };
    updatedExecutionResult.headerItems[0][0][3] = { measureHeaderItem: { name: 'Unique Dashboard Views (predicted)' } };
    updatedExecutionResult.headerItems[0][0][4] = { measureHeaderItem: { name: 'Absolute error' } };
    updatedExecutionResult.headerItems[0][0][5] = { measureHeaderItem: { name: 'Relative error' } };
  }

  console.log('updatedExecutionResult', updatedExecutionResult);
  return updatedExecutionResult;
}

export class LinearRegressionVisualization extends Component {
  render() {
    const { executionResult, ...visProps } = this.props;
    const updatedExecutionResult = updateExecutionResult(executionResult, this.props);

    return (<CustomVisualization
      {...visProps}
      executionResult={updatedExecutionResult}
      getData={getData.bind(this, this.props)}
      getContent={getContent.bind(this, this.props)}
    />);
  }
}

export default LinearRegressionVisualization;
