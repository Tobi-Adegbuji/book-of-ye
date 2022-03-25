import React from "react";
import styles from "../styles/Layout.module.css";

function Layout(props) {
return  <div className={styles.layout}>
          {props.children}
        </div>;
}

export default Layout;
