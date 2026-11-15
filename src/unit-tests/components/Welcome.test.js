import { flushPromises, mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"

import Welcome from "@/components/content/Welcome.vue"

function createWrapper () {
    return mount(Welcome, {
        global: {
            stubs: {
                "v-card-actions": { template: "<div><slot /></div>" },
                "v-spacer": { template: "<span />" },
                "v-btn": { template: "<button><slot /></button>" }
            }
        }
    })
}

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe("Welcome", () => {
    it("loads and renders the README as Markdown", async () => {
        const markdown = "# Holiday Exchange\n\nAdd your gift ideas here."
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(markdown)
        })
        vi.stubGlobal("fetch", fetchMock)

        const wrapper = createWrapper()
        await flushPromises()

        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchMock).toHaveBeenCalledWith(expect.any(URL))
        expect(wrapper.find("h1#readMe-holiday-exchange").text()).toBe("Holiday Exchange")
        expect(wrapper.text()).toContain("Add your gift ideas here.")
        expect(wrapper.html()).not.toContain("# Holiday Exchange")
    })

    it("renders an error message when the README request is unsuccessful", async () => {
        const errorMessage = "Error when trying to load README. Status: 503"
        const fetchMock = vi.fn().mockResolvedValue({
            ok: false,
            status: 503
        })
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
        vi.stubGlobal("fetch", fetchMock)

        const wrapper = createWrapper()
        await flushPromises()

        expect(wrapper.text()).toContain(errorMessage)
        expect(consoleError).toHaveBeenCalledWith(errorMessage)
    })

    it("emits goToDifferentPage with 'continue' when Continue is clicked", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            ok: true,
            text: () => Promise.resolve("")
        }))

        const wrapper = createWrapper()
        await wrapper.find("#continue-button").trigger("click")

        expect(wrapper.emitted("goToDifferentPage")).toEqual([["continue"]])
    })
})
