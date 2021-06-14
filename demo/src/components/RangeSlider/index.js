import style from "./style.scss"
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "preact/compat";


export default function RangeSlider({
    text,
    initValue = 0,
    range: {from = -1, to = 3} = {},
    onChange = () => {}
}){
    const thumb = useRef(null);
    const area = useRef();
    const [areaHeight, setAreaHeight] = useState(0);
    const [thumbHeight, setThumbHeight] = useState(0);

    const [position, setPosition] = useState();
    const [value, setValue] = useState(initValue)

    const updatePosition = position => {
        setPosition(Math.max(thumbHeight / 2, Math.min(position, areaHeight - thumbHeight / 2)))
    }

    const valueToPosition = (value) => {
        const range = Math.abs(to - from);
        const percentage = (value - from)/range;
        return (areaHeight - thumbHeight) - (areaHeight - thumbHeight ) * percentage + thumbHeight / 2
    }

    const positionToValue = (position) => {
        const range = Math.abs(to - from);
        const percentage = 1 - ((position - (thumbHeight / 2)) / (areaHeight - thumbHeight))
        return range * percentage + from;
    }

    const setPositionFromValue = value => {
       updatePosition(valueToPosition(value))
    }

    const updateValue = value => {
        if(!value)
            return;
        setValue(+value)
        setPositionFromValue(+value)
    }

    useEffect(() => {
        if(!areaHeight || !thumbHeight)
            return
        setPositionFromValue(initValue);
    }, [areaHeight, thumbHeight, initValue])

    useEffect(() => {
        if(position === undefined || !areaHeight)
            return;
        setValue(positionToValue(position))
    }, [position, areaHeight])

    useEffect(() => {
        if(typeof onChange !== "function")
            return;
        onChange(value)
    }, [value])


    const onClick = useCallback((event) => {
        const rect = event.target.closest("." + style["range-slider__area"]).getBoundingClientRect();

        const mouseMove = event => {
            const clientY = event.touches?.[0].clientY || event.clientY || 0;
            const position = clientY -  rect.top;
            updatePosition(position)
        }
        mouseMove(event)

        window.addEventListener("mousemove", mouseMove, {passive: true});
        window.addEventListener("mouseup", function mouseUp(){
            window.removeEventListener("mousemove", mouseMove, {passive: true});
            window.removeEventListener("mouseup", mouseUp)
        })

    }, [setPosition, areaHeight, thumbHeight])

    useLayoutEffect(() => {
        if(!area.current)
            return;

        const resizeObserver = new ResizeObserver(entries => {
            setAreaHeight(entries[0].contentRect.height)
        }, []);
        resizeObserver.observe(area.current)

        return () => {
            resizeObserver.disconnect();
        }
    }, [area,setAreaHeight])

    useLayoutEffect(() => {
        if(!thumb.current)
            return;
        const resizeObserver = new ResizeObserver( entries => {
            setThumbHeight(entries[0].contentRect.height)
        })
        resizeObserver.observe(thumb.current);
        return () => {
            resizeObserver.disconnect();
        }
    }, [setThumbHeight, thumb])

    const thumbStyle = useMemo( () => {
        return `transform: translateY(${position - thumbHeight / 2}px)`
    }, [position, thumbHeight])

    useEffect(() => console.log(value, typeof value), [value])

    return (
        <div className={style["range-slider"]}>
            <input className={style["range-slider__value"]} onInput={event => updateValue(event.target.value)} type="number" min={from} max={to} value={value.toFixed(2)}/>
            <div className={style["range-slider__area"]} onMouseDown={onClick} ref={area} onDragStart={() => false}>
                <div className={style["range-slider__thumb"]} ref={thumb} style={thumbStyle} onDragStart={() => false}/>
            </div>
            <p className={style["range-slider__text"]}>{text}</p>
        </div>
    )
}