import { CardMedia, CardText, CardTitle, CardHeader, RaisedButton } from 'material-ui';
import { GlassCard, FullPageCanvas, Glass } from 'meteor/clinical:glass-ui';

import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { browserHistory } from 'react-router';

import { get, has } from 'lodash';

import { Table } from 'react-bootstrap';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import { EJSON } from 'meteor/ejson';

import { Col, Grid, Row } from 'react-bootstrap';

import HGraph, { hGraphConvert, calculateHealthScore } from 'hgraph-react'; // symlinked with 'yarn link' from project root.

import { ObservationsTable } from 'meteor/clinical:hl7-resource-observation';
import { AllergyIntolerancesTable } from 'meteor/clinical:hl7-resource-allergy-intolerance';
import { ConditionsTable } from 'meteor/clinical:hl7-resource-condition';
import { ImmunizationsTable } from 'meteor/clinical:hl7-resource-immunization';
import { CarePlansTable } from 'meteor/clinical:hl7-resource-careplan';
import { MedicationStatementsTable } from 'meteor/clinical:hl7-resource-medication-statement';
import { MedicationOrdersTable } from 'meteor/clinical:hl7-resource-medication-order';
import { DiagnosticReportsTable } from 'meteor/clinical:hl7-resource-diagnostic-report';
import { PatientsTable } from 'meteor/clinical:hl7-resource-patient';
import { ProceduresTable } from 'meteor/clinical:hl7-resource-procedure';

import { scaleLinear } from 'd3-scale';
import metrics from '../data/metrics.healthrecords.json';

let sampleData = [
  {
    "metric": "totalCholesterol",
    "value": 0,
    "children": [
      {
        "metric": "ldl",
        "value": 100
      },
      {
        "metric": "hdl",
        "value": 50
      },
      {
        "metric": "triglycerides",
        "value": 200
      }
    ]
  },
  {
    "metric": "bloodPressureSystolic",
    "value": 0
  },
  {
    "metric": "bloodPressureDiastolic",
    "value": 0
  },
  {
    "metric": "alcoholUse",
    "value": 0
  },
  {
    "metric": "nicotineUse",
    "value": 0
  },
  {
    "metric": "painLevel",
    "value": 0
  },
  {
    "metric": "waistCircumference",
    "value": 0
  },
  {
    "metric": "weight",
    "value": 0
  },
  {
    "metric": "exercise",
    "value": 0
  },
  {
    "metric": "sleep",
    "value": 0
  },
  {
    "metric": "happiness",
    "value": 0
  },
  {
    "metric": "glucose",
    "value": 0
  }
];

Session.setDefault('hideToggles', true);
Session.setDefault('themePrimaryColor', 'green');
Session.setDefault('systemOfMeasurement', 'imperial');

export class HealthgraphPage extends React.Component {
  constructor(props) {
    super(props);
  }
  calculateScoreFromMetric(metric){
    let scale;
  
    // TODO: Review score calcs
    if (metric.value > metric.healthyMax) {
      // if it's high, healthyMax to absoluteMax, 1 to 0
      scale = scaleLinear()
        .domain([metric.healthyMax, metric.absoluteMax])
        .range([1, 0]);
    } else if (metric.value < metric.healthyMin) {
      // if it's low, healthyMin to absolute Min, 1 to 0
      scale = scaleLinear()
        .domain([metric.healthyMin, metric.absoluteMin])
        .range([1, 0]);
    } else {
      // if it's healthy, perfect score
      return 1;
    }
  
    return scale(metric.value);
  }
  calculateHealthScore(data){
    // TODO: Review score calcs

    let totalWeight = 0;
    data.map(d => {
      totalWeight += d.weight;
    });

    if (totalWeight !== 100) {
      console.log("Total weight of values does not equal 100%");
    }

    let scoreTotal = 0;

    data.map(d => {
      const score = this.calculateScoreFromMetric(d);
      const weightPercentage = d.weight / 100;
      const weightedScore = weightPercentage * score;
      scoreTotal += weightedScore;
    });

  return scoreTotal * 100;
  }
  convertDataSet(data){
    return data.map(d => {
      const converted = hGraphConvert('male', d.metric, d);
      converted.id = d.metric;
      if (d.children) {
        converted.children = d.children.map(c => {
          const convertedChild = hGraphConvert('male', c.metric, c);
          convertedChild.parentKey = c.parentKey;
          convertedChild.id = c.metric;
          return convertedChild;
        })
      }
      return converted;
    });
  }
  getMeteorData() {

    let imgHeight = (Session.get('appHeight') - 210) / 3;

    let data = {
      style: {
        page: {},
        coverImg: {
          maxWidth: 'inherit',
          maxHeight: 'inherit',
          height: 'inherit'
        },
        cards: {
          media: {
            height: (imgHeight - 1) + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          practitioners: {
            cursor: 'pointescale-downr',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          organizations: {
            cursor: 'pointer',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          locations: {
            cursor: 'pointer',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          }
        },
        inactiveIndexCard: {
          opacity: .5,
          width: '100%',
          display: 'inline-block',
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingBottom: '0px'
        },
        tile: {
          width: '100%',
          display: 'inline-block',
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingBottom: '0px',
          marginBottom: '20px',
          height: imgHeight + 'px'
        },
        spacer: {
          display: 'block'
        },
        title: Glass.darkroom(),
        subtitle: Glass.darkroom()
      },
      ccd: {
        allergyIntolerances: [],
        careplans: [],
        conditions: [],
        diagnosticReports: [],
        immunizations: [],
        medications: [],
        medicationOrders: [],
        medicationStatements: [],
        observations: [],
        patients: [],
        procedures: []
      },
      minimongo: {
        allergyIntolerances: [],
        careplans: [],
        conditions: [],
        diagnosticReports: [],
        immunizations: [],
        medications: [],
        medicationOrders: [],
        medicationStatements: [],
        observations: [],
        patients: [],
        procedures: []
      },
      query: {},
      hideEnteredInError: Session.get('hideEnteredInError'),
      hidePatientName: Session.get('hidePatientName'),
      hideToggles: Session.get('hideToggles'),
      hideActionIcons: Session.get('hideActionIcons'),
      hideIdentifiers: Session.get('hideIdentifiers'),
      currentYearData: [],
      currentScore: 0
    };


    // update sample dataset
    let components;
    let diastolic;
    let systolic;


    let resultingData = [];
    sampleData.forEach(function(datum){
      switch (datum.metric) {
        case "totalCholesterol":
          console.log('Observations.find(cholesterol)', Observations.find().count())
          datum.value = 0.5;
          datum.weight = 0;
          resultingData.push(datum);
          break;
        case "bloodPressureSystolic":
          // console.log('Observations.find().bloodPressureSystolic', Observations.find({'component.code.coding.code': '8480-6'}).count())
          let lastSystolicObservation = Observations.find({'component.code.coding.code': '8480-6'}, {sort: {'effectiveDateTime': -1}}).fetch()[0];
          if(lastSystolicObservation){
            console.log('Most recent systolic BP observation', lastSystolicObservation);
            components = get(lastSystolicObservation, 'component');
            components.forEach(function(component){
              if(get(component, 'code.coding[0].code') === "8480-6"){
                datum.value = get(component, 'valueQuantity.value', 0)
              }
            })
            datum.weight = 10;
            resultingData.push(datum);  
          }
          break;
        case "bloodPressureDiastolic":
          let lastDiastolicObservation = Observations.find({'component.code.coding.code': '8462-4'}, {sort: {'effectiveDateTime': -1}}).fetch()[0];
          if(lastDiastolicObservation){
            console.log('Most recent diastolic BP observation', lastDiastolicObservation);
            components = get(lastDiastolicObservation, 'component');
            components.forEach(function(component){
              if(get(component, 'code.coding[0].code') === "8480-6"){
                datum.value = get(component, 'valueQuantity.value', 0)
              }
            })
            datum.weight = 10;
            resultingData.push(datum);  
          }
          break;
        case "alcoholUse":
          datum.value = 0;
          datum.weight = 20;
          resultingData.push(datum);
          break;
        case "nicotineUse":
          datum.value = 0;
          datum.weight = 20;
          resultingData.push(datum);
          break;
        case "painLevel":
          datum.value = 0;
          datum.weight = 20;
          resultingData.push(datum);
          break;
        case "waistCircumference":
          // datum.value = 40;
          // resultingData.push(datum);
          break;
        case "weight":
          // console.log('Observations.find(weight)', Observations.find({'code.coding.code': '29463-7'}).count())
          let lastWeightMeasurement = Observations.find({'code.coding.code': '29463-7'}, {sort: {'effectiveDateTime': -1}}).fetch()[0];
          if(lastWeightMeasurement){
            console.log('Most recent weight observation', lastWeightMeasurement);
            datum.value = get(lastWeightMeasurement, 'valueQuantity.value');

            if(Session.equals('systemOfMeasurement', 'imperial')){
              datum.value = datum.value * 2.205;
            }

            datum.weight = 20;
            resultingData.push(datum);  
          }
          break;
        case "exercise":
          // datum.value = 8;
          // resultingData.push(datum);
          break;
        case "sleep":
          // datum.value = 8;
          // resultingData.push(datum);
          break;
        case "happiness":
          // datum.value = 9;
          // resultingData.push(datum);
          break;
        case "glucose":
          // datum.value = 70;
          // resultingData.push(datum);
          break;
        case "other":
          // datum.value = 0.5;
          // resultingData.push(datum);
          break;
                  
        default:
          break;
      }
    })

    console.log('resultingData', resultingData)

    data.currentYearData = this.convertDataSet(resultingData);
    data.currentScore = parseInt(this.calculateHealthScore(this.convertDataSet(resultingData)), 10);


    data.style.indexCard = Glass.darkroom(data.style.indexCard);

    if (Session.get('appWidth') < 768) {
      data.style.inactiveIndexCard.width = '100%';
      data.style.inactiveIndexCard.marginBottom = '10px';
      data.style.inactiveIndexCard.paddingBottom = '10px';
      data.style.inactiveIndexCard.paddingLeft = '0px';
      data.style.inactiveIndexCard.paddingRight = '0px';

      data.style.spacer.display = 'none';
    }

    if(Session.get('appHeight') > 1200){
      data.style.page = {
        top: '50%',
        transform: 'translateY(-50%)',
        position: 'relative'
      }
    }

    if(Meteor.user()){

      var filters = get(Meteor.user(), 'profile.filters');

      if(filters){
        if(filters.remove && filters.remove.length > 0){
          data.query.$nor = [];
          filters.remove.forEach(function(term){
            if(term){
              data.query.$nor.push({ "code.text": { "$regex": "^" + term, "$options": "i" } })
            }
          });  
        }
  
        if(filters.mustHave && filters.mustHave.length > 0){
          data.query.$or = [];
          filters.mustHave.forEach(function(term){
            if(term){
              data.query.$or.push({ "code.text": { "$regex": "^" + term, "$options": "i" } })
            }
          })          
        }

        if(get(filters, 'sensitiveItems.substanceAbuse')){
          if(!data.query.$nor) data.query.$nor = [];
          // Additional info:
          // http://www.healthvermont.gov/sites/default/files/documents/2016/11/ADAP_ICD-10_ADAP_Approved_Conversion_Codes.pdf
          data.query.$nor.push({ "code.text": { "$regex": "^alcohol", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^cocain", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^cocaine", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^opioid", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^hallucinogen", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^psychoactive substance", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^cannabis", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^abuse", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^dependence", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^intoxication", "$options": "i" } })
        }

        if(get(filters, 'sensitiveItems.mentalHealth')){
          if(!data.query.$nor) data.query.$nor = [];
          data.query.$nor.push({ "code.text": { "$regex": "^anxiety", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^adjustment disorder", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^post-traumatic stress disorder", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^depressive", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^disorder", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^personality", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^phobia", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^obsessional", "$options": "i" } })

          // TODO: filter explicit codes
          // https://www.simplepractice.com/blog/top-icd-10-codes-behavioral-health-2017/  
        }
        if(get(filters, 'sensitiveItems.sexualHealth')){
          if(!data.query.$nor) data.query.$nor = [];
          data.query.$nor.push({ "code.text": { "$regex": "^neisseria", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^gonorrhoeae", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^gonnorrhoeae", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^gonnorrhea", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^chlamydia", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^syphilis", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^hepatitis", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^eGFR", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^HIV", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^AIDS", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^herpes", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^crabs", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^chlamydia", "$options": "i" } })

          data.query.$nor.push({ "code.text": { "$regex": "^estrogen", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^estradiol", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^testosterone", "$options": "i" } })
          data.query.$nor.push({ "code.text": { "$regex": "^progesterone", "$options": "i" } })

          // TODO:  filter explicit codes
          // https://www.aapc.com/blog/32415-sti-screening-under-medicare/
        }
      }

      
      if(typeof AllergyIntolerances === "object"){
        data.ccd.allergyIntolerances = AllergyIntolerances.find().fetch();
      }
      if(typeof CarePlans === "object"){
        data.ccd.carePlans = CarePlans.find().fetch();
      }
      if(typeof Conditions === "object"){
        let conditionsQuery = {};
        if(data.query){
          conditionsQuery = data.query;
        }
        if(Session.get('hideEnteredInError')){          
          conditionsQuery.verificationStatus = {$nin: ["entered-in-error"]}  // unconfirmed | provisional | differential | confirmed | refuted | entered-in-error
        }
        data.ccd.conditions = Conditions.find(conditionsQuery).fetch();
      }
      if(typeof DiagnosticReports === "object"){
        data.ccd.diagnosticReports = DiagnosticReports.find(data.query).fetch();
      }
      if(typeof Immunizations === "object"){
        data.ccd.immunizations = Immunizations.find().fetch();
      }
      if(typeof Medications === "object"){
        data.ccd.medications = Medications.find().fetch();
      }
      if(typeof Medications === "object"){
        data.ccd.medicationOrders = MedicationOrders.find().fetch();
      }        
      if(typeof MedicationStatements === "object"){
        data.ccd.medicationStatements = MedicationStatements.find().fetch();
      }
      if(typeof Patients === "object"){
        data.ccd.patients = Patients.find().fetch();
      }
      if(typeof Observations === "object"){
        data.ccd.observations = Observations.find(data.query).fetch();
      }
      if(typeof Procedures === "object"){
        data.ccd.procedures = Procedures.find(data.query).fetch();
      }  
    }





    if(process.env.NODE_ENV === "test") console.log("HealthgraphPage[data]", data);
    return data;
  }

  rowClick(){
    console.log('rowClick')
  }
  render() {
    const size = 600;

    var themePrimaryColor;


    if(Session.get('themePrimaryColor') === 'pink'){
      themePrimaryColor = '#ecdcde';
    } else if (Session.get('themePrimaryColor') === "blue"){
      themePrimaryColor = '#d5ddf6';
    } else if (Session.get('themePrimaryColor') === "green"){
      themePrimaryColor = '#98BD8E';
    }




    return (
      <div id='indexPage'>
        <FullPageCanvas>
          <GlassCard height='auto'>
            <CardTitle 
              title="Healthgraph Dashboard" 
              subtitle="August 17th, 2019" 
              style={{fontSize: '100%'}} />
            <CardText style={{fontSize: '100%'}}>
              <Col md={6} style={{fontWeight: 200, fontFamily: "Helvetica Neue", textAlign: 'center'}} >
                <HGraph
                  data={ this.data.currentYearData }
                  score={ this.data.currentScore }
                  width={ size }
                  height={ size }
                  fontSize={ size < 300 ? 12 : 16 }
                  pointRadius={ size < 300 ? 5 : 10 }
                  scoreFontSize={ size < 300 ? 60 : 120 }
                  healthyRangeFillColor={themePrimaryColor}
                  showScore={false}
                />                
              </Col>
              <Col md={6} >
                <AllergyIntolerancesTable
                  data={ this.data.ccd.allergyIntolerances } 
                  hideIdentifier={this.data.hideIdentifiers}
                  hideCategory={true}
                  displayDates={false}
                  hidePatient={this.data.hidePatientName} 
                  hideEnteredInError={true}
                  hideToggle={this.data.hideToggles}
                  hideActionIcons={this.data.hideActionIcons}
                />
                <br />
                <ConditionsTable
                  data={ this.data.ccd.conditions } 
                  hideIdentifier={this.data.hideIdentifiers}
                  hideEvidence={true}
                  hideServerity={true}
                  hideEnteredInError={true}
                  hideAsserterName={true}
                  hidePatientName={this.data.hidePatientName}
                  hideCheckboxes={this.data.hideToggles}
                  hideActionIcons={this.data.hideActionIcons}
                />          
                <br />
                <DiagnosticReportsTable 
                  data={ this.data.ccd.diagnosticReports } 
                  hidePatientName={this.data.hidePatientName}
                  displayDates={true} 
                  hideCheckboxes={this.data.hideToggles}
                  hideActionIcons={this.data.hideActionIcons}
                />
                <br />
                <ImmunizationsTable 
                  data={ this.data.ccd.immunizations } 
                  hidePatientName={this.data.hidePatientName}
                  displayDates={true} 
                  hideCheckboxes={this.data.hideToggles}
                  hideIdentifier={this.data.hideIdentifiers}
                  hidePatient={this.data.hidePatientName}
                  hidePerformer={true}
                  hideActionIcons={this.data.hideActionIcons}
                />
                <br />
                <MedicationOrdersTable
                  medicationOrders={ this.data.ccd.medicationOrders } 
                  hidePatientName={this.data.hidePatientName}
                  hidePrescriberName={true}
                  displayDates={true} 
                  hideCheckboxes={this.data.hideToggles}
                  hideActionIcons={this.data.hideActionIcons}
                  hideIdentifier={this.data.hideIdentifiers}
                />
                <br />
                <MedicationStatementsTable
                  data={ this.data.ccd.medicationStatements } 
                  hidePatientName={this.data.hidePatientName}
                  hidePrescriberName={true}
                  displayDates={true} 
                  hideCheckboxes={this.data.hideToggles}
                  hideActionIcons={this.data.hideActionIcons}                  
                />
                <br />
                <ObservationsTable
                  observations={ this.data.ccd.observations } 
                  hideBarcodes={true}
                  hideValue={true}
                  hideComparator={true}
                  hideSubjects={true}
                  hidePatientName={this.data.hidePatientName}
                  multiline={true}
                  query={this.data.query}
                  hideCheckboxes={this.data.hideToggles}
                  hideActionIcons={this.data.hideActionIcons}
                />
                <br />
                <ProceduresTable
                  data={ this.data.ccd.procedures } 
                  hideIdentifier={this.data.hideIdentifiers}
                  hideSubject={this.data.hidePatientName}
                  hideCategory={true}
                  hidePerformer={true}
                  hideBodySite={true}
                  displayDates={true} 
                  hideCheckboxes={this.data.hideToggles}
                  hideActionIcons={this.data.hideActionIcons}
                />

              </Col> 
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


ReactMixin(HealthgraphPage.prototype, ReactMeteorData);

export default HealthgraphPage;