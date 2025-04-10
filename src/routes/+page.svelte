<svelte:head>
    <script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<script lang="ts">
    type Asset = {
        image: string,
        name: string,
        exchange: string
    }

    const assets: Asset[] = [
        { image: "/t.svg", name: "Nvidia", exchange: "Xetra" },
        { image: "/t.svg", name: "Nvidia", exchange: "Gettex" },
        { image: "/t.svg", name: "Nvidia", exchange: "LS Exchange" }
    ]
</script>

<div class="p-4">
    <div class="mx-auto w-auto max-w-[512px] h-auto border border-black rounded-xl grid grid-cols-1 gap-y-2 p-4">
        <div class="mb-3 text-3xl font-bold underline text-center">Step 1: Search the Exchange</div>
    </div>
    <div class="mt-3 mx-auto w-auto max-w-[512px] h-auto border border-black rounded-xl grid grid-cols-1 gap-y-2 p-4">
        <div class="mb-3 text-3xl font-bold underline text-center">Step 2: Choose the Exchange</div>
        {#each assets as element}
            <div class="w-full h-auto border border-black rounded-xl flex">
                <img src="{element.image}" alt="" class="w-16 h-16 rounded-l-xl shrink-0" />
                <div class="w-full h-16 px-4 py-1">
                    <div class="w-full h-8 text-xl font-bold flex justify-start items-center">{element.name}</div>
                    <div class="w-full h-6 text-sm flex justify-start items-center">{element.exchange}</div>
                </div>
                <div class="w-fit h-16 rounded-r-xl flex justify-center items-center shrink-0 px-4">
                    <button class="w-fit h-auto text-white bg-blue-500 rounded-xl cursor-pointer px-4 active:scale-90">Select</button>
                </div>
            </div>
        {/each}
    </div>
    <div class="mt-3 mx-auto w-auto max-w-[512px] h-auto border border-black rounded-xl grid grid-cols-1 gap-y-2 p-4">
        <div class="mb-3 text-3xl font-bold underline text-center">Step 3: Add Custom Data</div>
        <form>
            <label>
                <span>Official Name:</span>
                <input type="text" value="NVIDIA CORP." class="border border-black rounded-xl px-4" />
            </label>
            <br />
            <label>
                <span>Name:</span>
                <input type="text" value="Nvidia" class="border border-black rounded-xl px-4" />
            </label>
            <br />
            <label>
                <span>ISIN:</span>
                <input type="text" value="US67066G1040" class="border border-black rounded-xl px-4" />
            </label>
            <br />
            <label>
                <span>WKN:</span>
                <input type="text" value="918422" class="border border-black rounded-xl px-4" />
            </label>
        </form>
    </div>
</div>
