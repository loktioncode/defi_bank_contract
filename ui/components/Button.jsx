import styles from "../styles/button.module.css";


export default function Button(props) {

    return (
        <button onClick={props.action()} className={`${styles.button} + flex-1 `} >
            {props.text}
        </button>

    );
}


