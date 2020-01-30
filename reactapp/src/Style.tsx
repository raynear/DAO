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
    overflowHidden: {
      overflow: "hidden"
    },
    bullet: {
      display: "inline-block",
      margin: "0 2px",
      transform: "scale(0.8)"
    },
    title: {
      fontSize: 18,
      flexGrow: 1
    },
    link: {
      textDecoration: "none",
      color: "#000000"
    },
    pos: {
      marginBottom: 12
    },
    formControl: {
      margin: theme.spacing(0),
      minwidth: 240
    },
    viewer: {
      height: "350px",
      overflow: "auto"
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
      margin: "auto",
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
    paddingSide: {
      margin: theme.spacing(0),
      padding: theme.spacing(0),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    table: {
      minWidth: 650,
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
    pagination: {
      flexShrink: 0,
      marginLeft: theme.spacing(2.5)
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
