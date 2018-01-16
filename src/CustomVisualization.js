import React, { Component } from 'react';
import { ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';

import { get, unzip, range } from 'lodash';

export const DEFAULT_COLOR_PALETTE = [
  'rgb(20,178,226)',
  'rgb(0,193,141)',
  'rgb(229,77,66)',
  'rgb(241,134,0)',
  'rgb(171,85,163)',

  'rgb(244,213,33)',
  'rgb(148,161,174)',
  'rgb(107,191,216)',
  'rgb(181,136,177)',
  'rgb(238,135,128)',

  'rgb(241,171,84)',
  'rgb(133,209,188)',
  'rgb(41,117,170)',
  'rgb(4,140,103)',
  'rgb(181,60,51)',

  'rgb(163,101,46)',
  'rgb(140,57,132)',
  'rgb(136,219,244)',
  'rgb(189,234,222)',
  'rgb(239,197,194)'
].map( color => '#' + /rgb\(([\d]*),([\d]*),([\d]*)\)/
  .exec(color)
  .slice(1)
  .map(val => ('0' + parseInt(val, 10)
    .toString(16))
    .slice(-2))
  .join('')
);
console.log('DEFAULT_COLOR_PALETTE', DEFAULT_COLOR_PALETTE);

export function getData(executionResult) {
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

  return data;
}

export function getContent(executionResult, data) {
  const executionData = get(executionResult, 'data', []);
  const barCount = executionData.length;

  const bars = range(barCount).map( barIndex => (
    <Bar
      key={barIndex}
      name={ get(executionResult, `headerItems[0][0][${barIndex}].measureHeaderItem.name`) }
      dataKey={barIndex}
      fill={DEFAULT_COLOR_PALETTE[barIndex]}
      label={{ position: 'top' }}
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

export class CustomVisualization extends Component {
  static defaultProps = {
    height: 300,
    executionResult: [],
    getContent,
    getData
  };

  constructor(props) {
    super(props);
    this.state = {
      displayRawData: false
    }
    this.toggleDisplayRawData = this.toggleDisplayRawData.bind(this);
  }

  toggleDisplayRawData() {
    this.setState({ displayRawData: !this.state.displayRawData})
  }

  render() {
    const { executionResult, getContent, getData, height } = this.props;
    const { displayRawData } = this.state;

    console.log('executionResult', executionResult);

    const data = getData(executionResult);
    const content = getContent(executionResult, data);

    console.log('CustomVisualization data', data);
    console.log('CustomVisualization content', content);

    if (!data.length) {
      return <h2 style={{textAlign: 'center'}}>Loading...</h2>;
    }

    const displayRawDataButton = <button className="button button-secondary" onClick={this.toggleDisplayRawData} >Toggle Raw Data</button>;

    return (<div>
      <ResponsiveContainer width="100%" height={height}>
        {content}
      </ResponsiveContainer>
      { displayRawData ? <div>{displayRawDataButton}<pre>{JSON.stringify(executionResult, null, '  ')}</pre><pre>{JSON.stringify(data, null, '  ')}</pre></div> : displayRawDataButton }
    </div>);
  }
}

export default CustomVisualization;
