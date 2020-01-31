import React from "react";
import SwipeableViews from "react-swipeable-views";
import { Grid, Box, TextField, Button, Typography, AppBar, Tabs, Tab } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import clsx from "clsx";

import useStyles from "./Style";

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </Typography>
  );
}

function Profile(props: any) {
  // console.log("Profile props", props);
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };

  return (
    <Grid container className={classes.container}>
      <Grid item className={classes.grid}>
        <Typography>Username</Typography>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="full width tabs example"
          >
            <Tab label="Item One" />
            <Tab label="Item Two" />
            <Tab label="Item Three" />
          </Tabs>
        </AppBar>
      </Grid>
      <Grid>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={value}
          onChangeIndex={handleChangeIndex}
        >
          <TabPanel value={value} index={0} dir={theme.direction}>change avatar</TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>change Password</TabPanel>
          <TabPanel value={value} index={2} dir={theme.direction}>verify</TabPanel>
        </SwipeableViews>
      </Grid>
    </Grid>
  );
}

export default Profile;
