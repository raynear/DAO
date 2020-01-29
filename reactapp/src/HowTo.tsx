import React from "react";
import useStyles from "./Style";
import { Grid, Paper } from "@material-ui/core";
import { TUIViewer } from "./TUIEditor";

function HowTo(props: any) {
  const classes = useStyles();

  const contents = `
# **Instructions for P-reps**

*Create a P-rep page to propose votes to your own ICX delegators*

Sign up

1. Click “Join Now” on the top right to sign up
[https://lh5.googleusercontent.com/GXaCwe0N9-u6jfGLp1QNjAtbFstvihaBK-qeo9PYR_dJmoEfEoyq1IPeaWNPcLekl47qgZdeMar7iKbrpHsB0I25m4qcvTrhR2jczfNPz1U0kKylqI9hYR1c14zd9ALwwKYwiova](https://lh5.googleusercontent.com/GXaCwe0N9-u6jfGLp1QNjAtbFstvihaBK-qeo9PYR_dJmoEfEoyq1IPeaWNPcLekl47qgZdeMar7iKbrpHsB0I25m4qcvTrhR2jczfNPz1U0kKylqI9hYR1c14zd9ALwwKYwiova)
2. Type in “Username” and “Password” to sign up
3. Verify P-rep node ownership by signing a transaction from publicly known P-rep wallet
    1. Click “Verify ICON Address” to sign a transaction
    2. Click “Check Your Verified Address” so that blockchain can confirm
[https://lh5.googleusercontent.com/d-DtJB4tbztPgrotVcNn1XCnziLblW8MNMA-UKZPDArJ6WUog6MjUXNyJZptdu6o2dGIVASI8CgutOBd20XpS5rXgirFLFgv_9GRR_liap6naniiFdmSYlXbQG4GRHaFUyF7tO5P](https://lh5.googleusercontent.com/d-DtJB4tbztPgrotVcNn1XCnziLblW8MNMA-UKZPDArJ6WUog6MjUXNyJZptdu6o2dGIVASI8CgutOBd20XpS5rXgirFLFgv_9GRR_liap6naniiFdmSYlXbQG4GRHaFUyF7tO5P)
4. Blockchain has verified the P-rep ownership. The following image will appear
    1. Click “Make New P-rep DAO Page” to build your own DAO page
[https://lh3.googleusercontent.com/1OLzmLPzrVPzlUb4z79QOl7fLOdzMU-IoEJBAbqOQx60BBJCsJq97vNOZ-V9KmYWV02cIz6ZOLffVnotIHZtrgJXyC0DT9p57pJRBbrph3MjKTYzLJDlTAEww8UGyIyYRyFM5rPk](https://lh3.googleusercontent.com/1OLzmLPzrVPzlUb4z79QOl7fLOdzMU-IoEJBAbqOQx60BBJCsJq97vNOZ-V9KmYWV02cIz6ZOLffVnotIHZtrgJXyC0DT9p57pJRBbrph3MjKTYzLJDlTAEww8UGyIyYRyFM5rPk)

Propose a vote

1. Sign in as a P-rep with “Username” and “Password”
2. “Launch new votes” will appear for P-reps
3. Click “Launch new votes”
[https://lh3.googleusercontent.com/lw8Moqqz0zCU9VAEEJCQZujoc-K9BEYlbZBAyA13hTdbBX52H-jMY9mBjljQy-m-uSFfrafYXSucrqmWJBG7L5lzevCRKW9X6xrhSeKMNLPhEOZeag_S27dPth9nh-DJ3bPpx7CH](https://lh3.googleusercontent.com/lw8Moqqz0zCU9VAEEJCQZujoc-K9BEYlbZBAyA13hTdbBX52H-jMY9mBjljQy-m-uSFfrafYXSucrqmWJBG7L5lzevCRKW9X6xrhSeKMNLPhEOZeag_S27dPth9nh-DJ3bPpx7CH)
4. Click the “NEW” button to propose a vote
5. Fill out the following information
    1. Subject of the vote
    2. Options for the vote
    3. Description of the vote
    4. Vote Duration
    5. Participation Quorum (ex: vote needs 20%+ of ICX delegated to ICX Station to participate in the vote for the vote to be valid)
    6. Minimum approval rate to pass (ex: option A needs 50%+ of votes to approve in order to pass)
[https://lh4.googleusercontent.com/pAhIKR5MOb1aQ05vAWvyADFl0Aw0V7Slj9XLhoD2uZj_AJcEgE7sNcQKQGqPTFRcjVtPey2gn3pcjIqd0ZWR5ATq1BAa2X3g64hlOxAjlGjxs2cA4rMXbziavqQXyt6Qy2Zm3Em5](https://lh4.googleusercontent.com/pAhIKR5MOb1aQ05vAWvyADFl0Aw0V7Slj9XLhoD2uZj_AJcEgE7sNcQKQGqPTFRcjVtPey2gn3pcjIqd0ZWR5ATq1BAa2X3g64hlOxAjlGjxs2cA4rMXbziavqQXyt6Qy2Zm3Em5)
6. The Draft page will appear. Please make sure to check the details and click “Publish”
    1. Green graph shows “Quorum requirement”
    2. Blue graph shows “Minimum Approval Rate”
    3. “Total Delegation” represents Total # of ICX delegated to the P-rep
[https://lh6.googleusercontent.com/vX2LN9M6FnNlqRw6LZKa4oaFLXiVW9qEc9F09I_ZUtw8PGBJf6nNsWQPkOnHa4FP1LX6XvSskNDLQDv4mgaoLt5tI5j6YXqmk-tswWaAUAncDG-HdG0BFj-6DR7mrjze_qOQvs0G](https://lh6.googleusercontent.com/vX2LN9M6FnNlqRw6LZKa4oaFLXiVW9qEc9F09I_ZUtw8PGBJf6nNsWQPkOnHa4FP1LX6XvSskNDLQDv4mgaoLt5tI5j6YXqmk-tswWaAUAncDG-HdG0BFj-6DR7mrjze_qOQvs0G)
7. The new vote will be recorded on the blockchain and the transaction can be found in the vote explorer under the P-rep’s page
8. Make sure to share the vote link to your community so that they can participate in the vote (Twitter, FB link available)
[https://lh5.googleusercontent.com/cjU68W6OdEgoT5OBm_N7okrAXwgmOVcq-1Zcy3B_IW5JSDaupkNTaM1Lvg1XKhg2hiU05BX0SjX0WVPezolCJQaX6zAFWZpZkXSXcL5mDi30SwqYd12tyXgP9gsGeEFuxxX26XCT](https://lh5.googleusercontent.com/cjU68W6OdEgoT5OBm_N7okrAXwgmOVcq-1Zcy3B_IW5JSDaupkNTaM1Lvg1XKhg2hiU05BX0SjX0WVPezolCJQaX6zAFWZpZkXSXcL5mDi30SwqYd12tyXgP9gsGeEFuxxX26XCT)

**Instructions for ICX delegator**

*How to Participate in a vote proposed by a P-rep*

Sign up

1. Click “Join Now” on the top right to sign up
[https://lh5.googleusercontent.com/GXaCwe0N9-u6jfGLp1QNjAtbFstvihaBK-qeo9PYR_dJmoEfEoyq1IPeaWNPcLekl47qgZdeMar7iKbrpHsB0I25m4qcvTrhR2jczfNPz1U0kKylqI9hYR1c14zd9ALwwKYwiova](https://lh5.googleusercontent.com/GXaCwe0N9-u6jfGLp1QNjAtbFstvihaBK-qeo9PYR_dJmoEfEoyq1IPeaWNPcLekl47qgZdeMar7iKbrpHsB0I25m4qcvTrhR2jczfNPz1U0kKylqI9hYR1c14zd9ALwwKYwiova)
2. Type in “Username” and “Password” to sign up
3. Verify ICX wallet ownership by signing a transaction from one’s wallet
    1. Click “Verify ICON Address” to sign a transaction
    2. Click “Check Your Verified Address” so that the blockchain can confirm
[https://lh5.googleusercontent.com/d-DtJB4tbztPgrotVcNn1XCnziLblW8MNMA-UKZPDArJ6WUog6MjUXNyJZptdu6o2dGIVASI8CgutOBd20XpS5rXgirFLFgv_9GRR_liap6naniiFdmSYlXbQG4GRHaFUyF7tO5P](https://lh5.googleusercontent.com/d-DtJB4tbztPgrotVcNn1XCnziLblW8MNMA-UKZPDArJ6WUog6MjUXNyJZptdu6o2dGIVASI8CgutOBd20XpS5rXgirFLFgv_9GRR_liap6naniiFdmSYlXbQG4GRHaFUyF7tO5P)
5. Blockchain has verified the wallet ownership. The following image will appear
    1. Click “Make New Profile” to build your own profile
[https://lh5.googleusercontent.com/t82GviB4OGbkr2YyUCdReFcmlJ42rP-wkBM90569aFofMlS82ZrKa3ROPUcg-H9nT1I6T-N83TNqa9jdzaYHIFkgPEamVaF884EsDUVJT-yPfmlpY3YcffDZOeZ20bS2_9mdJI8O](https://lh5.googleusercontent.com/t82GviB4OGbkr2YyUCdReFcmlJ42rP-wkBM90569aFofMlS82ZrKa3ROPUcg-H9nT1I6T-N83TNqa9jdzaYHIFkgPEamVaF884EsDUVJT-yPfmlpY3YcffDZOeZ20bS2_9mdJI8O)

Participate in a vote

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
[https://lh3.googleusercontent.com/QUl66JtrB88Sq4YqvTkTPUAzeYxswX4wmMGHbQMU2kQrZtJZQpS2Hdn_Gfn_-Y7B-fuXAjAwnMB12u95yo1qSbUcwKQ2Y9t-WRX4XzGnBIT1qWmHjLaITiXEXZZ0qLFSE80yUIBu](https://lh3.googleusercontent.com/QUl66JtrB88Sq4YqvTkTPUAzeYxswX4wmMGHbQMU2kQrZtJZQpS2Hdn_Gfn_-Y7B-fuXAjAwnMB12u95yo1qSbUcwKQ2Y9t-WRX4XzGnBIT1qWmHjLaITiXEXZZ0qLFSE80yUIBu)
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