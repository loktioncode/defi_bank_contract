

const InputField = (props) => {


    return (
        <fieldset className="w-full space-y-4 mb-8 dark:text-gray-100">
        <label className="block text-sm dark:text-gray-700 font-medium">{props.labelName}</label>
        <div className="flex">
            <input type="text" name={props.id} id={props.id} placeholder={props.placeHolder} className="flex flex-1 text-right border sm:text-sm py-5 rounded-l-md focus:ring-inset dark:border-gray-700 dark:text-gray-100 dark:bg-gray-800 focus:ring-violet-400" onChange={(e) => props.onChange(e)} />
            <span className="flex items-center px-3 pointer-events-none sm:text-sm rounded-r-md dark:bg-gray-700">{props.currency}</span>
        </div>
    </fieldset>
    );

};


export default InputField;