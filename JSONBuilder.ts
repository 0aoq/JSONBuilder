/**
 * @file Handle building JSON input into HTML
 * @name JSONBuilder.ts
 * @author 0aoq <hkau@oxvs.net>
 * @version 1.0.0
 * @license MIT
 * ------------------------
 * Please see https://github.com/oxvs/JSONBuilder/blob/main/LICENSE for information about licensing.
 */

// classes
export interface jsbwindow extends Window {
    "onload:listeners.jsb": any
}

export const jsbwindow: jsbwindow = window as any
jsbwindow["onload:listeners.jsb"] = []

export class JSONBuilder {
    attachTo: HTMLElement
    updateStylesheet: any
    objectCount: number
    objectMap: any
    atoms: any[]
    add: any
    remove: any
    getHTML: any
    mount: any

    constructor(props: any) {
        this.attachTo = props.attachTo
        this.attachTo.id = "__JSONBuild_Render"

        document.head.insertAdjacentHTML('beforeend', `
            <style id="jsb-stylesheet">
                #${this.attachTo.id} {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
                /* atoms */
            </style>
        `)

        this.updateStylesheet = (stylesheet: string) => {
            document.getElementById("jsb-stylesheet")!.innerHTML = stylesheet
        }

        this.objectCount = 0 // the first thing that is loaded will have the highest id because it is the last thing to be added
        this.objectMap = {} // maps object id to object

        // atoms
        this.atoms = []
        const createAtom = (data: any) => {
            /*
             * Atoms are small components that are used to define simple elements that all have the same style
             * and use the same classes. An atom is just an element of a specific tag that will have the required
             * styles and classes applied to it.
             */

            this.atoms.push(data)
            this.updateStylesheet(`
                ${data.tag} { ${data.styles || '/* no data */'} }`)

            return (data)
        }

        // html manipulation
        this.add = (element: string) => {
            this.attachTo.insertAdjacentHTML('beforeend', element)

            // add classes to atoms
            for (let atom of this.atoms) {
                const elements = document.getElementsByTagName(atom.tag)
                for (let element of elements) {
                    for (let _class of atom.classes) {
                        element.classList.add(_class)
                    }
                }
            }
        }

        this.remove = (element: HTMLElement) => {
            this.attachTo.removeChild(element)
        }

        this.getHTML = (props: any) => {
            // components
            if (!props) return
            if (!props.raw && !props.atom && !props.read) {
                if (props.tag === undefined) {
                    props.tag = 'jsb-element'
                }

                if (props.import) {
                    props.children = [props.import[0]] // importing something will probably return an array of one element, which is our component
                }

                if (!props.children) {
                    props.children = []
                }

                // collect child objects
                let children = ""

                const evaluateChild = (child: any) => {
                    if (typeof child !== "string" && typeof child !== "function") {
                        children += this.getHTML(child) // each child is a component with the same data structure the parent has
                    } else if (typeof child === "string") {
                        children += child
                    } else if (typeof child === "function") {
                        const result = child()

                        if (typeof result === "object") {
                            for (let i in result) {
                                children += this.getHTML(result[i])
                            }
                        } else {
                            children += this.getHTML(result)
                        }
                    }
                }

                for (let child of props.children) {
                    evaluateChild(child)
                }

                // fix invalid properties
                if (props.classes === undefined) {
                    props.classes = ""
                }

                // attributes
                let attributes = ""

                if (props.attributes) {
                    for (let attribute of props.attributes) {
                        // { name: "string", value: "string" }
                        attributes += ` ${attribute.name}="${attribute.value}"`
                    }
                }

                // update object map
                if (!props._jsb_id) {
                    // we're creating a new object, so we need to increment the object count
                    this.objectCount++;
                    props._jsb_id = this.objectCount
                    this.objectMap[this.objectCount] = props
                    props.classes += ` jsb-object-${props._jsb_id}`
                } else {
                    // we're updating an existing object, so we need to update the object map
                    this.objectMap[props._jsb_id] = props
                    props.classes += ` jsb-object-${props._jsb_id}`
                }

                // create HTML
                return (`
                    <${props.tag} class="${props.classes.toString().replaceAll(/,/g, " ") || ''}" id="${props.id || `jsb-object-${props._jsb_id}`}"${attributes}>
                        ${children}
                    </${props.tag}>
                `)
            } else if (props.raw) {
                // component is written using raw html
                return props.raw
            } else if (props.atom) {
                // component is an atom
                createAtom(props.atom)
                return ''
            } else if (props.read) {
                // component is requesting another component to be read
                this.getHTML(props.read[0])
                return ''
            }
        }

        this.mount = (props: any) => { // mount an imported component to the DOM as the root
            const { getHTML, add } = this
            const html = getHTML(props)
            add(html)

            if (jsbwindow["onload:listeners.jsb"]) {
                // run the onJSBLoad function when the tree is loaded
                for (let listener of jsbwindow["onload:listeners.jsb"]) {
                    // each listener is a function that needs to wait for the tree to be loaded
                    listener()
                }
            }
        }
    }
}

export const getContents = (path: string) => {
    return new Promise((resolve, reject) => {
        fetch(path)
            .then(response => response.text())
            .then(data => {
                resolve(data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

// default export
export default {
    JSONBuilder,
    getContents
}