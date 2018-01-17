import React, { Component } from 'react';
import { ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Text } from 'recharts';
import { CustomVisualization, DEFAULT_COLOR_PALETTE } from './CustomVisualization';
import gen from 'random-seed';
import regression from 'regression';

import { get, unzip, range, invert, mapValues } from 'lodash';
import { immutableSet } from './utils';

export class OptimisedRegressionVisualization extends Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.toggleVisibility = this.toggleVisibility.bind(this);
    this.state = {};
  }

  updateData(props) {
    const data = this.getData(props);
    const keyVisibility = mapValues(invert({...data.keys}), () => true);
    this.setState({
      data,
      keyVisibility,
    });
  }

  componentWillReceiveProps(nextProps) {
    this.updateData(nextProps);
  }

  componentWillMount() {
    this.updateData(this.props);
  }

  toggleVisibility(context) {
    console.log('toggleVisibility', context);
    console.log('this.state.keyVisibility[context.dataKey]', this.state.keyVisibility[context.dataKey]);
    const isSelected = this.state.keyVisibility[context.dataKey];
    const keys = Object.keys(this.state.keyVisibility);
    const allSelected = !keys.some( key => !this.state.keyVisibility[key] );
    const keyVisibility = {
      ...this.state.keyVisibility
    };

    keys.map( key => (keyVisibility[key] = key === context.dataKey ? !keyVisibility[key] : keyVisibility[key] ) );

    this.setState({
      keyVisibility
    });
  }

  getData(props) {
    const { testKey } = props;
    const valueCount = 15;
    const seed = 'lorem ipsum ';
    const random = gen(seed);
    const randomRange = 2;
    const indexes = range(valueCount + 1).slice(1);
    const series = {
      constant: indexes.map( index => 25 + random.floatBetween(-randomRange,randomRange) ),
      linear: indexes.map( index => index * 2 + 5 + random.floatBetween(-randomRange,randomRange) ),
      exponential: indexes.map( index => 5 * Math.exp(0.4 * index) + 155 + random.floatBetween(-randomRange,randomRange) ),
      logarithmic: indexes.map( index => 3 * Math.log(2 * index) + 3 + random.floatBetween(-randomRange,randomRange) ),
      power: indexes.map( index => 3 * Math.pow(index, 2) + 115 + random.floatBetween(-randomRange,randomRange) ),
      polynomial: indexes.map( index => 0.5 * Math.pow(index, 3) - 4 * Math.pow(index, 2) + index + 100 + random.floatBetween(-randomRange,randomRange) ),
    };
    let keys = [
      'constant',
      'linear',
      'exponential',
      'logarithmic',
      'power',
      'polynomial',
    ];

    let labels = {
      constant: 'Constant (25 + noise)',
      linear: 'Linear (2x + 5 + noise)',
      exponential: 'Exponential (0.1e^0.5x + 155 + noise)',
      logarithmic: 'Logarithmic (3 * lnx + 3 + noise)',
      power: 'Power (0.25x^2 + 115 + noise)',
      polynomial: 'Polynomial (0.5x^3 - 4x^2 + x + 100 + noise)',
    };

    let points = indexes.map( pointIndex => {
      const dataPoint = { x: pointIndex};
      keys.forEach( key => {
        dataPoint[key] = series[key][pointIndex - 1];
      } );
      return dataPoint;
    } );

    let bestModel = null;
    let bestR2 = null;

    if (testKey) {
      console.log('testKey', testKey);

      points = indexes.map( pointIndex => {
        const dataPoint = {
          x: pointIndex,
          [testKey]: series[testKey][pointIndex - 1]
        };
        return dataPoint;
      } );

      keys = [testKey];

      const regressionModels = [
        'linear',
        'exponential',
        'logarithmic',
        'power',
        'polynomial',
      ];

      const overlapCount = 3;
      const predictionCount = 5;

      points = points.concat( range(predictionCount).map( index => ({
        x: points.length + index
      }) ) );

      const trainingData = series[testKey].slice(0, -overlapCount).map( (pointValue, pointIndex) => [ pointIndex + 1, pointValue ]);

      regressionModels.map( regressionKey => {
        const result = regression[regressionKey](trainingData, { precision: 2, order: 3});
        console.log(regressionKey, 'result', result);
        if (bestR2 === null || result.r2 > bestR2 ) {
          bestR2 = result.r2;
          bestModel = regressionKey;
        }
        const regressionModelSlug = regressionKey + 'Model';
        points = points.map( pointData => (
          {
            ...pointData,
            [regressionModelSlug]: result.predict(pointData.x)[1]
          }
        ) );
        labels[regressionModelSlug] = regressionKey + ' r2: ' + result.r2 + ' (' + result.string + ')'
        keys.push(regressionModelSlug);
      } );

    }

    return {
      points,
      series,
      keys,
      labels,
      bestModel,
      bestR2
    };
  }
  render() {
    const { height = 300 } = this.props;
    const { data, keyVisibility } = this.state;
    console.log('data', data);
    console.log('keyVisibility', keyVisibility);
    const formatterMap = {
      // 5: (value) => (Math.round(value * 10000) / 100 + ' %')
    };

    const defaultFormatter = (value) => (Math.round(value * 100) / 100).toString(10);

    const bars = data.keys.map( (dataKey, pointIndex) => (
      <Bar
        key={dataKey}
        name={data.labels[dataKey]}
        dataKey={dataKey}
        hide={!keyVisibility[dataKey]}
        fill={DEFAULT_COLOR_PALETTE[pointIndex]}
        label={{ fill: DEFAULT_COLOR_PALETTE[pointIndex], fontSize: 10, position: 'top', formatter: formatterMap[pointIndex] || defaultFormatter}}
      />
    ) );

    return (<div>
      { data.bestR2 !== null ? <h3>Best model: {data.bestModel} with R<sup>2</sup> {data.bestR2}</h3> : null }
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data.points}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          {bars}
          <Legend onClick={ this.toggleVisibility }/>
        </BarChart>
      </ResponsiveContainer>
    </div>);
  }
}

export default OptimisedRegressionVisualization;
