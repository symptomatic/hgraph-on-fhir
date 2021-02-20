import React, { useState } from 'react';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';

import { Button } from '@material-ui/core';

import { get, has } from 'lodash';
import JSON5 from 'json5';

import { useTracker, LayoutHelpers, Locations } from 'meteor/clinical:hl7-fhir-data-infrastructure';

import moment from 'moment';



//========================================================================================================

import {
  fade,
  ThemeProvider,
  MuiThemeProvider,
  withStyles,
  makeStyles,
  createMuiTheme,
  useTheme
} from '@material-ui/core/styles';

  // Global Theming 
  // This is necessary for the Material UI component render layer
  let theme = {
    appBarColor: "#f5f5f5 !important",
    appBarTextColor: "rgba(0, 0, 0, 1) !important",
  }

  // if we have a globally defined theme from a settings file
  if(get(Meteor, 'settings.public.theme.palette')){
    theme = Object.assign(theme, get(Meteor, 'settings.public.theme.palette'));
  }

  const muiTheme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
    palette: {
      appBar: {
        main: theme.appBarColor,
        contrastText: theme.appBarTextColor
      },
      contrastThreshold: 3,
      tonalOffset: 0.2
    }
  });


  const buttonStyles = makeStyles(theme => ({
    west_button: {
      cursor: 'pointer',
      justifyContent: 'left',
      color: theme.palette.appBar.contrastText,
      marginLeft: '20px',
      marginTop: '15px',
      float: 'left'
    },
    east_button: {
      cursor: 'pointer',
      justifyContent: 'right',
      color: theme.palette.appBar.contrastText,
      right: '20px',
      marginTop: '15px',
      float: 'right'
      // position: 'absolute'
    }
  }, {index: 1}));


//============================================================================================================================
// Shared Functions






//============================================================================================================================
// FETCH


export function HealthGraphFooterButtons(props){
  const buttonClasses = buttonStyles();

  function measureVitals(){
    console.log('Measuring Vitals');

    Meteor.call('initVitalSigns');    
  }
  return (
    <MuiThemeProvider theme={muiTheme} >
      <Button onClick={ measureVitals.bind(this) } className={ buttonClasses.west_button }>
        Measure Vitals
      </Button>      
    </MuiThemeProvider>
  );
}



