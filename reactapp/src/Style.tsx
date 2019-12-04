import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      minWidth: 275
    },
    avatar: {
      margin: 10
    },
    bigAvatar: {
      margin: 10,
      width: 60,
      height: 60
    },
    bullet: {
      display: "inline-block",
      margin: "0 2px",
      transform: "scale(0.8)"
    },
    title: {
      fontSize: 14,
      flexGrow: 1
    },
    pos: {
      marginBottom: 12
    },
    formControl: {
      margin: theme.spacing(0),
      minwidth: 240
    },
    papercontainer: {
      spacing: theme.spacing(0),
      margin: theme.spacing(2),
      padding: theme.spacing(0),
      overflow: "auto"
    },
    paper: {
      margin: theme.spacing(1),
      padding: theme.spacing(1),
      display: "flex",
      overflow: "auto",
      flexDirection: "column"
    },
    rootcontainer: {
      spacing: theme.spacing(0),
      margin: theme.spacing(0),
      padding: theme.spacing(1),
      display: "flex",
      flexwrap: "wrap"
    },
    container: {
      spacing: theme.spacing(0),
      margin: theme.spacing(0),
      padding: theme.spacing(0),
      display: "flex",
      flexwrap: "wrap"
    },
    grid: {
      margin: theme.spacing(0),
      padding: theme.spacing(0)
    },
    item: {
      margin: theme.spacing(0),
      padding: theme.spacing(1)
    },
    center: {
      textAlign: "center"
    },
    left: {
      textAlign: "left"
    },
    right: {
      textAlign: "right"
    },
    selectLabel: {
      margin: theme.spacing(0),
      marginLeft: theme.spacing(2)
    },
    textField: {
      margin: theme.spacing(0),
      width: "100%"
    },
    root: {
      display: "flex"
    },
    toolbar: {
      paddingRight: 24 // keep right padding when drawer closed
    },
    noMarginPadding: {
      margin: 0,
      padding: 0
    },
    toolbarIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      padding: "0 8px",
      ...theme.mixins.toolbar
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      })
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    margin: {
      margin: theme.spacing(1)
    },
    menuButton: {
      marginRight: 36
    },
    menuButtonHidden: {
      display: "none"
    },
    drawerPaper: {
      position: "relative",
      whiteSpace: "nowrap",
      width: drawerWidth,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      })
    },
    drawerPaperClose: {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9)
      }
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      height: "100vh",
      overflow: "auto"
    },
    fixedHeight: {
      height: 600
    }
  })
);

export default useStyles;
