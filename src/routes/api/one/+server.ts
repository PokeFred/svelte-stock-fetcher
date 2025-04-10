import type { RequestHandler } from "./$types"
import { Builder, Browser, By, until } from "selenium-webdriver"
import type { WebDriver, WebElement } from "selenium-webdriver"
import { Options } from "selenium-webdriver/chrome"
import axios from "axios"
import type { AxiosResponse } from "axios"

type Exchange = {
    notation: string,
    name: string
}

async function fetchExchanges(identifier: string): Promise<Exchange[]> {
    const options: Options = new Options()
    options.addArguments("--headless")

    const driver: WebDriver = new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(options)
        .build()

    let exchanges: Exchange[] = []
    try {
        let url: string = `https://www.onvista.de/suche/?searchValue=${identifier}`
        await driver.get(url)

        url = await driver.getCurrentUrl()
        url = url.replace("https://www.onvista.de/aktien", "https://www.onvista.de/aktien/handelsplaetze")
        await driver.get(url)

        await driver.wait(until.elementsLocated(By.css("select#select-history-market")), 5000)
        const selectBox: WebElement = await driver.findElement(By.css("select#select-history-market"))
        const selectOptions: WebElement[] = await selectBox.findElements(By.css("option"))

        for (const element of selectOptions) {
            const s: string = await element.getText()

            if (s === "Xetra (EUR, verzögert)") {
                exchanges.push({ notation: await element.getAttribute("value"), name: "Xetra" })
            } else if (s === "gettex (EUR, Echtzeit)") {
                exchanges.push({ notation: await element.getAttribute("value"), name: "gettex" })
            } else if (s === "LS Exchange (EUR, Echtzeit)") {
                exchanges.push({ notation: await element.getAttribute("value"), name: "LS Exchange" })
            }
        }
    } catch (error: unknown) {
        console.log(error)
        exchanges = []
    }

    await driver.quit()
    return exchanges
}

type A = {
    type: string,
    name: string,
    isin: string,
    wkn: string,
    id: string,
    exchanges: Exchange[]
}

async function fetchData(): Promise<A | null> {
    try {
        const response: AxiosResponse = await axios({
            method: "GET",
            url: "https://api.onvista.de/api/v1/stocks/ISIN:US67066G1040/snapshot"
        })
        const data = response.data

        return {
            type: data.instrument.entityType,
            name: data.instrument.name,
            isin: data.instrument.isin,
            wkn: data.instrument.wkn,
            id: data.quote.idInstrument,
            exchanges: []
        }
    } catch (error: unknown) {
        console.log(error)
        return null
    }
}

export const GET: RequestHandler = async ({ url }): Promise<Response> => {
    const isin: string | null = url.searchParams.get("isin")
    const wkn: string | null = url.searchParams.get("wkn")

    let identifier: string | null = null
    if ((isin !== null) && (isin.length === 12)) identifier = isin
    else if ((wkn !== null) && (wkn.length === 6)) identifier = wkn

    if (identifier !== null) {
        const raw: A | null = await fetchData()

        if (raw === null) {
            const data: string = JSON.stringify({ message: "Error: invalid isin or wkn." })
            return new Response(data, {
                status: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": data.length.toString(),
                    "Accept-Ranges": "bytes"
                }
            })
        }
        raw.exchanges = await fetchExchanges(identifier)

        const data: string = JSON.stringify(raw)
        return new Response(data, {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": data.length.toString(),
                "Accept-Ranges": "bytes"
            }
        })
    } else {
        const data: string = JSON.stringify({ message: "Error: invalid isin or wkn." })
        return new Response(data, {
            status: 400,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": data.length.toString(),
                "Accept-Ranges": "bytes"
            }
        })
    }
}
