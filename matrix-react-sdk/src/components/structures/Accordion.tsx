import React, { FC, useEffect, useRef, useState } from "react";
import classnames from "classnames";

interface IProps {
  title: string;
  content: string;
  className: string;
}

const Accordion: FC<IProps> = (props) => {
  const [active, setActive] = useState(false);
  const [height, setHeight] = useState("0px");
  const content = useRef(null);

  useEffect(() => {
    console.log("Height for ", props.title, ": ", height);
  }, [height]);

  function toggleAccordion() {
    setActive(!active);
    setHeight(active ? "0px" : `${content.current.scrollHeight}px`);
  }

  const classNames = classnames(props.className, {
    accordion__section: true,
    active: active
  })

  return (
    <div className={classNames}>
      <div className="accordion__wrap">
        <div
          className={`accordion ${active ? "active" : ""}`}
          onClick={toggleAccordion}
        >
          <p className="accordion__title">{props.title}</p>
          <span style={{ marginLeft: "20px" }} className={`${active ? "arrow-top" : "arrow-bottom"}`}></span>
        </div>
        <div
          ref={content}
          style={{ maxHeight: `${height}` }}
          className="accordion__content"
        >
          <div
            className="accordion__text"
            dangerouslySetInnerHTML={{ __html: props.content }}
          />
        </div>
      </div>
    </div>
  );
}

export default Accordion;
