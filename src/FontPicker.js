import {
  FONT_FAMILY_DEFAULT,
  FontManager,
  OPTIONS_DEFAULTS,
} from "@samuelmeuli/font-manager"
import React, { useState, useEffect, useRef } from "react"

const FontPicker = ({
  apiKey,
  initialFontFamily = FONT_FAMILY_DEFAULT,
  pickerId = OPTIONS_DEFAULTS.pickerIde,
  families = OPTIONS_DEFAULTS.families,
  categories = OPTIONS_DEFAULTS.categories,
  scripts = OPTIONS_DEFAULTS.scripts,
  variants = OPTIONS_DEFAULTS.variants,
  filter = OPTIONS_DEFAULTS.filter,
  limit = OPTIONS_DEFAULTS.limit,
  sort = OPTIONS_DEFAULTS.sort,
  onChange = () => {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState("loading")
  const [activeFontFamily, setActiveFontFamily] = useState(initialFontFamily)
  const [fonts, setFonts] = useState([])

  const fontManager = useRef()
  const fontPickerNode = useRef()

  const options = {
    pickerId,
    families,
    categories,
    scripts,
    variants,
    filter,
    limit,
    sort,
  }

  useEffect(() => {
    fontManager.current = new FontManager(
      apiKey,
      initialFontFamily,
      options,
      onChange
    )
    fontManager.current
      .init()
      .then(() => {
        setLoadingStatus("finished")
        let fetchedFonts = Array.from(fontManager.current.getFonts().values())
        if (sort === "alphabet") {
          fetchedFonts.sort((font1, font2) =>
            font1.family.localeCompare(font2.family)
          )
        }
        setFonts(fetchedFonts)
      })
      .catch((err) => {
        setLoadingStatus: "error"
        console.error("Error trying to fetch the list of available fonts")
        console.error(err)
      })
  }, [])

  useEffect(() => {
    fontManager.current?.setActiveFont(activeFontFamily)
  }, [activeFontFamily])

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener("click", handleClickOutside)
    } else {
      document.removeEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isExpanded])

  const handleClickOutside = (e) => {
    if (fontPickerNode.current.contains(e.target)) {
      return
    }
    setIsExpanded(false)
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const onSelection = (e) => {
    const target = e.target
    const slectedFontFamily = target.textContent
    if (!slectedFontFamily) {
      throw Error(`Missing font family in clicked font button`)
    }
    setActiveFontFamily(slectedFontFamily)
    toggleExpanded()
  }

  const getFontId = (fontFamily) => {
    return fontFamily.replace(/\s+/g, "-").toLowerCase()
  }

  const generateFontList = (fonts) => {
    if (loadingStatus !== "finished") {
      return <div />
    }
    return (
      <ul className="font-list">
        {fonts.map((font) => {
          const fontId = getFontId(font.family)
          return (
            <li key={fontId} className="font-list-item">
              <button
                type="button"
                id={`font-button-${fontId}${fontManager.current?.selectorSuffix}`}
                className={`font-button ${
                  font.family === activeFontFamily && "active-font"
                }`}
                onClick={onSelection}
                onKeyPress={onSelection}
              >
                {font.family}
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <div
      ref={fontPickerNode}
      id={`font-picker${fontManager.current?.selectorSuffix}`}
      className={isExpanded ? "expanded" : ""}
    >
      <button
        type="button"
        className="dropdown-button"
        onClick={toggleExpanded}
        onKeyPress={toggleExpanded}
      >
        <p className="dropdown-font-family">{activeFontFamily}</p>
        <p className={`dropdown-icon ${loadingStatus}`} />
      </button>
      {loadingStatus === "finished" && generateFontList(fonts)}
    </div>
  )
}

export default FontPicker
