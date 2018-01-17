import React, { Component } from 'react';
import ReactDOM from 'react-dom';
// import './style.css';
import '@gooddata/goodstrap/lib/theme-indigo.scss';
import '@gooddata/react-components/styles/css/main.css';

import { Visualization, CoreComponents } from '@gooddata/react-components';
import { CustomVisualization } from './CustomVisualization';
import { LinearRegressionVisualization } from './LinearRegressionVisualization';
import { OptimisedRegressionVisualization } from './OptimisedRegressionVisualization';

import { Layout, pageTitle } from './Layout';

export const title = pageTitle;

const CustomBaseChart = (VisualizationComponent, visProps = {}, baseChartProps = {}) => (props) => {
  console.log('CustomBaseChart', props);
  return (<CoreComponents.BaseChart {...props} {...baseChartProps} visualizationComponent={(baseProps) => <VisualizationComponent {...baseProps} {...visProps} />} />);
};

const stages = [
  {
    name: 'Original Data',
    render: () => (<Visualization
      projectId="asl50ejeo8bzp97i9pxlbcm3vkuvzy72"
      uri="/gdc/md/asl50ejeo8bzp97i9pxlbcm3vkuvzy72/obj/1418123"
      key="stage-0"
      BaseChartComponent={CustomBaseChart(CustomVisualization, {height: 300, stage: 0})}
    />)
  },
  {
    name: 'Removed last 5 values',
    render: () => (<Visualization
      projectId="asl50ejeo8bzp97i9pxlbcm3vkuvzy72"
      uri="/gdc/md/asl50ejeo8bzp97i9pxlbcm3vkuvzy72/obj/1418123"
      key="stage-1"
      BaseChartComponent={CustomBaseChart(LinearRegressionVisualization, {height: 600, stage: 1})}
    />)
  },
  {
    name: 'Linear regression based on single column (Active Users)',
    render: () => (<Visualization
      projectId="asl50ejeo8bzp97i9pxlbcm3vkuvzy72"
      uri="/gdc/md/asl50ejeo8bzp97i9pxlbcm3vkuvzy72/obj/1418123"
      key="stage-2"
      BaseChartComponent={CustomBaseChart(LinearRegressionVisualization, {height: 600, stage: 2})}
    />)
  },
  {
    name: 'Linear regression based on multiple columns (Active Users, Tab Views)',
    render: () => (<Visualization
      projectId="asl50ejeo8bzp97i9pxlbcm3vkuvzy72"
      uri="/gdc/md/asl50ejeo8bzp97i9pxlbcm3vkuvzy72/obj/1418123"
      key="stage-3"
      BaseChartComponent={CustomBaseChart(LinearRegressionVisualization, {height: 600, stage: 3})}
    />)
  },
  {
    name: 'Sample data for optimised regression',
    render: () => (<OptimisedRegressionVisualization key="stage-4" height={600} stage="4" />)
  },
  {
    name: 'Regression models for Constant (25 + noise)',
    render: () => (<OptimisedRegressionVisualization key="stage-4" height={600} stage="5" testKey="constant" />)
  },
  {
    name: 'Regression models for Linear (2x + 5 + noise)',
    render: () => (<OptimisedRegressionVisualization key="stage-4" height={600} stage="6" testKey="linear" />)
  },
  {
    name: 'Regression models for Exponential (0.1e^0.5x + 155 + noise)',
    render: () => (<OptimisedRegressionVisualization key="stage-4" height={600} stage="7" testKey="exponential" />)
  },
  {
    name: 'Regression models for Logarithmic (3 * lnx + 3 + noise)',
    render: () => (<OptimisedRegressionVisualization key="stage-4" height={600} stage="8" testKey="logarithmic" />)
  },
  {
    name: 'Regression models for Power (0.25x^2 + 155 + noise)',
    render: () => (<OptimisedRegressionVisualization key="stage-4" height={600} stage="9" testKey="power" />)
  },
  {
    name: 'Regression models for Polynomial (0.5x^3 - 4x^2 + x + 100 + noise)',
    render: () => (<OptimisedRegressionVisualization key="stage-4" height={600} stage="10" testKey="polynomial" />)
  },
  {
    name: 'Co jsem se naučil',
    render: () => (
      <div key="stage-11" >
        <h3>Custom vizualizace, aneb podstrkávání mock komponent kvůli testům se hodí IRL!</h3>
        <h3><a href="http://recharts.org/#/en-US/examples" target="_blank" >Recharts</a> - skvělé provedení, ale nedokonalá dokumentace (furt lepší než HC).</h3>
        <h3>Lineární a multilineární regrese - <a href="https://www.npmjs.com/package/smr" target="_blank" >SMR</a></h3>
        <h3>Regresní modely - <a href="https://github.com/Tom-Alexander/regression-js" target="_blank" >regression</a></h3>
        <h3>Lineární regrese - <a href="https://www.npmjs.com/package/smr" target="_blank" >SMR</a></h3>
        <h3>Log 0 a log pro X &gt; 0 neexistuje => některé regresní modely nedokáží pracovat s nulovými resp. zápornými hodnotami (proto index začíná od 1 a y &gt; 0)</h3>
        <h3>React Intl + GoodStrap je pain. Back to HTML + CSS</h3>
        <h3>Minor bug v BaseChartu - nereaguje na update BaseChartComponent</h3>
        <h3>Handling 'loading' a 'error' stavů v našich komponentech je pain</h3>
      </div>
    )
  },
];

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stage: 0
    };
    this.nextStage = this.nextStage.bind(this);
    this.previousStage = this.previousStage.bind(this);
  }

  nextStage() {
    this.setState({
      stage: Math.min(this.state.stage + 1, stages.length-1)
    });
  }

  previousStage() {
    this.setState({
      stage: Math.max(this.state.stage - 1, 0)
    });
  }


  render() {
    const { stage, resetComponent } = this.state;
    const stageObject = stages[this.state.stage];
    console.log('render stage', stage, stageObject);
    return (<Layout>
      <h1>{title}</h1>
      <p>
        <button onClick={this.previousStage} className="button button-secondary" >&lt;</button>
        <button onClick={this.nextStage} className="button button-secondary" >&gt;</button>
      </p>
      <h2>#{stage+1}: {stageObject.name}</h2>

      {stageObject.render(resetComponent)}

    </Layout>);
  }
}

export default App;

const wrapper = document.createElement('div');
document.body.appendChild(wrapper);
ReactDOM.render(<App />, wrapper);
