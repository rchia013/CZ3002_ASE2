import React, { Component } from "react";
import { Link as RouterLink } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { firebaseapp, base } from "../../base.js";
import './adminOrders.css'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { Paper, Snackbar } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';



var firebase = require("firebase");

class adminOrders extends Component {
  state = {
    admin: null,
    user: null,
    dialog: false,
    loading: true,
    orderdata: [],
    snackbar: false
  };

  // Checks status and adds user to state
  checkStatus() {
    firebaseapp.auth().onAuthStateChanged((user) => {
      if (user!=null) {
        this.setState({ user: user })

        // Dealing with admin
        firebaseapp.auth().currentUser.getIdTokenResult()
        .then(idTokenResult => {
          this.setState({
            admin: idTokenResult.claims.admin
          })
        })

        this.getOrders()

      } else {
        this.setState({ user: null });
      }
    });
  }

  componentDidMount() {
    this.checkStatus()
  }


  getOrders() {
    this.setState({loading: true})
    base.bindToState("orders/", {
      context: this,
      asArray: true,
      state: 'userdata',
      then(){
        var userList = this.state.userdata
        if (userList!=null){
          for(var i=0; i<userList.length; i++){
            this.getUserOrders(userList[i])
          }
        }
      }
      
    })
  }

  getUserOrders(arg) {
    console.log(arg)

    // Getting each user's orderID ("key": userID)
    var orderID = Object.keys(arg)
    var data = []
    for (var i=0; i<orderID.length; i++){
      if(orderID[i]!="key"){
        arg[orderID[i]].key = orderID[i]
        data = data.concat(arg[orderID[i]])
      }
    }
    var updatedorderdata = this.state.orderdata.concat(data)
    this.setState({ orderdata: updatedorderdata });
  }

  
  approveOrder(user_id, addPoints, orderID){
    var userpointsRef = firebaseapp.database().ref('/users/' + user_id + '/points')
    userpointsRef.once('value').then(function(snapshot){
        var updates = {}
        updates['/users/' + user_id + '/points'] = addPoints + snapshot.val()
        updates['/orders/' + user_id + '/' + orderID + '/approved'] = true
        return firebase.database().ref().update(updates)
      })
    this.setState({ snackbar: true })
    setTimeout(() => {
      window.location.reload();
    }, 2500);
    // Firebase updated
  }

  deleteOrder(user_id, orderID){
    var userpointsRef = firebaseapp.database().ref('/orders/' + user_id + '/' + orderID).remove()
    this.setState({ snackbar: true })
    setTimeout(() => {
      window.location.reload();
    }, 2500);
    // Firebase updated
  }

  handleSnackClose = (e, reason) => {
    if (reason === "clickaway"){
      return
    }
    this.setState({ snackbar: false })
  }


  render() {
    console.log("orderdata")
    console.log(this.state.orderdata)

    // Table rows
    var userOrders = this.state.orderdata
    if (userOrders!=null){
      console.log("updating again")
      var listItems2 = (
        <TableBody>
            {userOrders.map((d) =>
            (d.calendarEvents!=null) ?
            <TableRow>              
              <TableCell className="table-cell-scheduled" align="right">{d.key}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d.name}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Plastic Bottles']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Plastic Bag']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Shampoo Bottles']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Batteries']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Phones']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Computer']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Mason Jar']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Glass Bottles']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Light Bulb']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Florescent Tubes']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['Fairy Lights']}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{(d.calendarEvents!=null) ? d.calendarEvents.start.substr(0, d.calendarEvents.start.indexOf("T")) : null}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{(d.calendarEvents!=null) ? d.calendarEvents.start.substr(d.calendarEvents.start.indexOf("T")+1) : null}
                                      {(d.calendarEvents!=null) ? <p class="table_text"> - </p> : null}
                                      {(d.calendarEvents!=null) ? d.calendarEvents.end.substr(d.calendarEvents.end.indexOf("T")+1) : null}
                                      </TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d.address}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d.zip}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d.phone}</TableCell>
              <TableCell className="table-cell-scheduled" align="right">{d['points']}</TableCell>
            

              {/* For order approval */}
              <TableCell className="table-cell-scheduled" align="right">{((d.approved == null) || (d.approved !=true)) ? 
              <div><Button className="approve-btn" variant="contained" color="auto" size="large" onClick={()=>this.approveOrder(d.id, d.points, d.key)}>
                Approve
              </Button>
              <Button className="approve-btn" variant="contained" color="auto" size="large" onClick={()=>this.deleteOrder(d.id, d.key)}>
                Reject
              </Button></div>:
              <Button className="approved-btn" variant="contained" color="auto" size="large" disabled>
                Approved
              </Button>
              }</TableCell>

            </TableRow> : 
            <TableRow>              
            <TableCell align="right">{d.key}</TableCell>
            <TableCell className="name" align="right">{d.name}</TableCell>
            <TableCell align="right">{d['Plastic Bottles']}</TableCell>
            <TableCell align="right">{d['Plastic Bag']}</TableCell>
            <TableCell align="right">{d['Shampoo Bottles']}</TableCell>
            <TableCell align="right">{d['Batteries']}</TableCell>
            <TableCell align="right">{d['Phones']}</TableCell>
            <TableCell align="right">{d['Computer']}</TableCell>
            <TableCell align="right">{d['Mason Jar']}</TableCell>
            <TableCell align="right">{d['Glass Bottles']}</TableCell>
            <TableCell align="right">{d['Light Bulb']}</TableCell>
            <TableCell align="right">{d['Florescent Tubes']}</TableCell>
            <TableCell align="right">{d['Fairy Lights']}</TableCell>
            <TableCell align="right">{(d.calendarEvents!=null) ? d.calendarEvents.start.substr(0, d.calendarEvents.start.indexOf("T")) : null}</TableCell>
            <TableCell align="right">{(d.calendarEvents!=null) ? d.calendarEvents.start.substr(d.calendarEvents.start.indexOf("T")+1) : null}
                                    {(d.calendarEvents!=null) ? <p class="table_text"> - </p> : null}
                                    {(d.calendarEvents!=null) ? d.calendarEvents.end.substr(d.calendarEvents.end.indexOf("T")+1) : null}
                                    </TableCell>
            <TableCell align="right">{d.address}</TableCell>
            <TableCell align="right">{d.zip}</TableCell>
            <TableCell align="right">{d.phone}</TableCell>
            <TableCell align="right">{d['points']}</TableCell>
          

            {/* For order approval */}
            <TableCell align="right">{((d.approved == null) || (d.approved !=true)) ? 
            <div><Button className="approve-btn" variant="contained" color="auto" size="large" onClick={()=>this.approveOrder(d.id, d.points, d.key)}>
              Approve
            </Button>
            <Button className="approve-btn" variant="contained" color="auto" size="large" onClick={()=>this.deleteOrder(d.id, d.key)}>
              Reject
            </Button></div>:
            <Button className="approved-btn" variant="contained" color="auto" size="large" disabled>
              Approved
            </Button>
            }</TableCell>

          </TableRow>)}
        
        </TableBody>)
    } else
    {
      var listItems2 = (<p>Nothing yet</p>);
    }

    // Return is basically the html for whatever you want displayed.
    // Note that you can only return one html element, so in this case i wrapped everything in
    // <div class="home_content">
    return (
      <div class="admin_userorder">
            <section class="orderHistory">
              <h2>User Orders</h2>
              <Paper className="admin_order_table_paper">
                <TableContainer className="admin_order_table_container">
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell className="name">Name</TableCell>
                        <TableCell align="right">Plastic Bottles</TableCell>
                        <TableCell align="right">Plastic Bag</TableCell>
                        <TableCell align="right">Shampoo Bottles</TableCell>
                        <TableCell align="right">Batteries</TableCell>
                        <TableCell align="right">Phones</TableCell>
                        <TableCell align="right">Computer</TableCell>
                        <TableCell align="right">Mason Jar</TableCell>
                        <TableCell align="right">Glass Bottles</TableCell>
                        <TableCell align="right">Light Bulb</TableCell>
                        <TableCell align="right">Florescent Tubes</TableCell>
                        <TableCell align="right">Fairy Lights</TableCell>
                        <TableCell className="address" align="right">Date</TableCell>
                        <TableCell className="address" align="right">Pickup Window</TableCell>
                        <TableCell className="address" align="right">Address</TableCell>
                        <TableCell align="right">ZIP</TableCell>
                        <TableCell align="right">Contact No</TableCell>
                        <TableCell align="right">Points Earned</TableCell>
                        <TableCell align="center">Approval</TableCell>
                      </TableRow>
                    </TableHead>
                    {listItems2}
                  </Table>
                </TableContainer>
              </Paper>
              <div class="test_button">
                <Button
                  variant="contained"
                  color="auto"
                  size="large"
                  component={RouterLink}
                  to="/profile"
                >
                  Back
                </Button>
              </div>

              <Snackbar
                className="admin-snackbar"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                open={this.state.snackbar}
                autoHideDuration={2000}
                onClose={this.handleSnackClose}
                message="Success! Refresh the page to update!"
                action={
                  <React.Fragment>
                    <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleSnackClose}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </React.Fragment>
                }
              />
            </section>
          </div>
        )
    }
}

// Remember to export so that you can use this component elsewhere
export default adminOrders;
