import React from "react";
import useStyles from "./Style";
import { Grid, Paper } from "@material-ui/core";
import { TUIViewer } from "./TUIEditor";

function HowTo(props: any) {
  const classes = useStyles();

  const contents = `
# **Instructions for P-reps**

*Create a P-rep page to propose votes to your own ICX delegators*

#### Sign up

1. Click “Join Now” on the top right to sign up
![https://icon.vote/static/img1.png](https://icon.vote/static/img1.png)
2. Type in “Username” and “Password” to sign up
3. Verify P-rep node ownership by signing a transaction from publicly known P-rep wallet
    1. Click “Verify ICON Address” to sign a transaction
    2. Click “Check Your Verified Address” so that blockchain can confirm
![https://icon.vote/static/img2.png](https://icon.vote/static/img2.png)
4. Blockchain has verified the P-rep ownership. The following image will appear
    1. Click “Make New P-rep DAO Page” to build your own DAO page
![https://icon.vote/static/img3.png](https://icon.vote/static/img3.png)

#### Propose a vote

1. Sign in as a P-rep with “Username” and “Password”
2. “Launch new votes” will appear for P-reps
3. Click “Launch new votes”
![https://icon.vote/static/img4.png](https://icon.vote/static/img4.png)
4. Click the “NEW” button to propose a vote
5. Fill out the following information
    1. Subject of the vote
    2. Options for the vote
    3. Description of the vote
    4. Vote Duration
    5. Participation Quorum (ex: vote needs 20%+ of ICX delegated to ICX Station to participate in the vote for the vote to be valid)
    6. Minimum approval rate to pass (ex: option A needs 50%+ of votes to approve in order to pass)
![https://icon.vote/static/img5.png](https://icon.vote/static/img5.png)
6. The Draft page will appear. Please make sure to check the details and click “Publish”
    1. Green graph shows “Quorum requirement”
    2. Blue graph shows “Minimum Approval Rate”
    3. “Total Delegation” represents Total # of ICX delegated to the P-rep
![https://icon.vote/static/img6.png](https://icon.vote/static/img6.png)
7. The new vote will be recorded on the blockchain and the transaction can be found in the vote explorer under the P-rep’s page
8. Make sure to share the vote link to your community so that they can participate in the vote (Twitter, FB link available)
![https://icon.vote/static/img7.png](https://icon.vote/static/img7.png)

# **Instructions for ICX delegator**

*How to Participate in a vote proposed by a P-rep*

#### Sign up

1. Click “Join Now” on the top right to sign up
![https://icon.vote/static/img8.png](https://icon.vote/static/img8.png)
2. Type in “Username” and “Password” to sign up
3. Verify ICX wallet ownership by signing a transaction from one’s wallet
    1. Click “Verify ICON Address” to sign a transaction
    2. Click “Check Your Verified Address” so that the blockchain can confirm
![https://icon.vote/static/img9.png](https://icon.vote/static/img9.png)
5. Blockchain has verified the wallet ownership. The following image will appear
    1. Click “Make New Profile” to build your own profile
![https://icon.vote/static/img10.png](https://icon.vote/static/img10.png)

#### Participate in a vote

1. Sign in as a user with “Username” and “Password”
2. Click “Vote Explorer”
3. Click a P-rep one has delegated ICX to
4. P-rep page will show votes
    1. The P-rep page will also show total ICX delegated to the P-rep
    2. The P-rep page will also show user’s ICX delegated to the P-rep (voting power)
5. Click a vote you would like to participate in
6. Click an option you would like to vote for
7. The following result page will show up
    1. Red line on green bar shows “Quorum requirement” (ex: vote needs 20%+ of ICX delegated to ICX Station to participate in the vote for the vote to be valid)
    2. Minimum approval rate to pass (ex: option A needs 50%+ of votes to approve in order to pass)
    3. Total # of delegates: # of ICX delegated to the P-rep
    4. Total # of votes: # of P-rep delegated ICX that participated in the vote
    5. Your # of votes: # of user’s ICX delegated to the P-rep
    6. Votes will be recorded on the blockchain and shown at the bottom of the vote
![https://icon.vote/static/img11.png](https://icon.vote/static/img11.png)
`;

  return (
    <Grid item className={classes.grid} xs={12} md={12} lg={12}>
      <Paper className={classes.paper}>
        <Grid container className={classes.container}>
          <Grid item className={classes.paddingSide} xs={12} md={12} lg={12}>
            <TUIViewer
              initialValue={contents}
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}

export default HowTo;