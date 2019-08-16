import { CardMedia, CardText, CardTitle, CardHeader } from 'material-ui/Card';
import { GlassCard, VerticalCanvas, FullPageCanvas, Glass, DynamicSpacer } from 'meteor/clinical:glass-ui';
import { Col, Grid, Row } from 'react-bootstrap';

import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { browserHistory } from 'react-router';

import { get, has } from 'lodash';
import { moment } from 'meteor/momentjs:moment';

import { Session } from 'meteor/session';
import { ObservationsTable } from 'meteor/clinical:hl7-resource-observation';
import { Line } from 'nivo'
import { render } from 'react-dom'

// import { InlineMath, BlockMath } from 'react-katex';
// import 'katex/dist/katex.min.css';

export class BodyMassIndexPage extends React.Component {
  constructor(props) {
    super(props);
  }
  getMeteorData() {

    let imgHeight = (Session.get('appHeight') - 210) / 3;

    let data = {
      chart: {
        width: Session.get('appWidth') * 0.5,  
        height: 400
      },
      style: {              
        title: Glass.darkroom(),
        subtitle: Glass.darkroom()
      },
      organizations: {
        image: "/pages/provider-directory/organizations.jpg"
      },
      bmi: {
        height: 0,
        weight: 0
      }
    };

    data.style.indexCard = Glass.darkroom(data.style.indexCard);

    // if (Session.get('appWidth') < 768) {
    //   data.style.inactiveIndexCard.width = '100%';
    //   data.style.inactiveIndexCard.marginBottom = '10px';
    //   data.style.inactiveIndexCard.paddingBottom = '10px';
    //   data.style.inactiveIndexCard.paddingLeft = '0px';
    //   data.style.inactiveIndexCard.paddingRight = '0px';

    //   data.style.spacer.display = 'none';
    // }

    if(Session.get('appHeight') > 1200){
      data.style.page = {
        top: '50%',
        transform: 'translateY(-50%)',
        position: 'relative'
      }
    }

    if(Observations.find({'code.text': 'Weight'}).count() > 0){
      let recentWeight = Observations.find({'code.text': 'Weight'}, {sort: {effectiveDateTime: 1}}).fetch()[0];
      data.bmi.weight = get(recentWeight, 'valueQuantity.value', 0);
    }
    if(Observations.find({'code.text': 'Height'}).count() > 0){
      let recentHeight = Observations.find({'code.text': 'Height'}, {sort: {effectiveDateTime: 1}}).fetch()[0];
      data.bmi.height = get(recentHeight, 'valueQuantity.value', 0);
    }

    if(process.env.NODE_ENV === "test") console.log("BodyMassIndexPage[data]", data);
    return data;
  }
  render() {
    let observationQuery = {$or: [{'code.text': 'Height'}, {'code.text': 'Weight'}]}
    let bmi = (this.data.bmi.weight / this.data.bmi.height / this.data.bmi.height * 10000).toFixed(2);

    return (
      <div id='indexPage'>
        <FullPageCanvas>
          <GlassCard height='auto' >
            <CardTitle 
              title="Body Mass Calculator"
              titleStyle={{fontSize: '240%'}}
              subtitleStyle={{fontSize: '180%'}}
              />
            <CardText style={{fontSize: '180%'}}>
            <Grid fluid style={{marginTop: '40px', marginBottom: '80px'}}>            
              <Col md={6}>
                <Row>
                  <ObservationsTable query={{$or: [{'code.text': 'Height'}]}} />
                  <DynamicSpacer />
                  <ObservationsTable query={{$or: [{'code.text': 'Weight'}]}} />
                </Row>
              </Col>
              <Col md={6}>
                <Line
                  width={this.data.chart.width}
                  height={this.data.chart.height}
                  curve='cardinal'
                  data={[
                    {
                      "id": "weight",
                      "color": "hsl(122, 70%, 50%)",
                      "data": Observations.find({$or: [{'code.text': 'Weight'}]}, {sort: {effectiveDateTime: 1}}).map(function(observation){
                        return {
                          x: moment(get(observation, 'effectiveDateTime')).format('MMM DD, YYYY'),
                          y: get(observation, 'valueQuantity.value')
                        }
                      })
                    }
                  ]}
                  margin={{
                      "top": 50,
                      "right": 110,
                      "bottom": 50,
                      "left": 60
                  }}
                  minY="auto"
                  stacked={true}
                  axisBottom={{
                      "orient": "bottom",
                      "tickSize": 5,
                      "tickPadding": 5,
                      "tickRotation": 0,
                      "legend": "observation date",
                      "legendOffset": 36,
                      "legendPosition": "center"
                  }}
                  axisLeft={{
                      "orient": "left",
                      "tickSize": 5,
                      "tickPadding": 5,
                      "tickRotation": 0,
                      "legend": "weight (kg)",
                      "legendOffset": -40,
                      "legendPosition": "center"
                  }}
                  dotSize={10}
                  dotColor="inherit:darker(0.3)"
                  dotBorderWidth={2}
                  dotBorderColor="#ffffff"
                  enableDotLabel={true}
                  dotLabel="y"
                  dotLabelYOffset={-12}
                  animate={true}
                  motionStiffness={90}
                  motionDamping={15}
                  legends={[
                      {
                          "anchor": "bottom-right",
                          "direction": "column",
                          "translateX": 100,
                          "itemWidth": 80,
                          "itemHeight": 20,
                          "symbolSize": 12,
                          "symbolShape": "circle"
                      }
                  ]}
                />
                <DynamicSpacer />
                <div style={{width: '100%', textAlign: 'center'}}>
                  <h1>BMI = {this.data.bmi.weight} kg / {this.data.bmi.height} cm / {this.data.bmi.height} cm  * 10,000 = {bmi} </h1>
                  <a href="https://www.cdc.gov/nccdphp/dnpao/growthcharts/training/bmiage/page5_1.html">Centers for Disease Control - Body Mass Index Calculations</a>
                </div>
              </Col>
            </Grid>
            </CardText>
          </GlassCard>
        </FullPageCanvas>
      </div>
    );
  }




  openLink(url){
    console.log("openLink", url);
    browserHistory.push(url);
  }
}



ReactMixin(BodyMassIndexPage.prototype, ReactMeteorData);

export default BodyMassIndexPage;