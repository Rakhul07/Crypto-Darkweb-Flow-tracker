import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import BaseLayout from "./components/layout/BaseLayout";
import Home from "./Home";
import Analytics from "./components/Analytics";
import BalanceComponent from "./components/BalanceComponent";

const App = () => {
  return (
    <BaseLayout>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/home" />} />
        <Route exact path="/home" component={Home} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/balance" component={BalanceComponent} />
        <Route render={() => <Redirect to="/home" />} />
      </Switch>
    </BaseLayout>
  );
};

export default App;
