import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"

import AddPeople from "@/components/content/AddPeople.vue"

const componentStubs = {
    "v-row": { template: "<div><slot /></div>" },
    "v-col": { template: "<div><slot /></div>" },
    "v-card-actions": { template: "<div><slot /></div>" },
    "v-spacer": { template: "<span />" },
    "v-tooltip": { template: "<span><slot /></span>" },
    "v-btn": { template: "<button><slot /></button>" },
    "v-text-field": {
        props: ["modelValue", "label", "error", "errorMessages"],
        emits: ["update:modelValue"],
        template: `<input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />`
    }
}

function createWrapper (initialState = {}) {
    return mount(AddPeople, {
        plugins: [
            createTestingPinia({
                createSpy: vi.fn,
                stubActions: true,
                initialState
            })
        ],
        global: { stubs: componentStubs }
    })
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe("AddPeople", () => {
    it("emits the selected direction from the navigation buttons", async () => {
        const wrapper = createWrapper({
            peopleAttending: {
                peopleAttending: [
                    { name: "Jon", edit: false, editName: "Jon", nameDrawn: "" },
                    { name: "Jane", edit: false, editName: "Jane", nameDrawn: "" }
                ]
            }
        })

        await wrapper.find("#continue-button").trigger("click")
        await wrapper.find("#go-back-button").trigger("click")

        expect(wrapper.emitted("goToDifferentPage")).toEqual([["continue"], ["goBack"]])
    })

    it("disables adding an empty or duplicate name", () => {
        const wrapper = createWrapper({
            peopleAttending: {
                peopleAttending: [{ name: "Jon Doe", edit: false, editName: "Jon Doe", nameDrawn: "" }]
            }
        })

        expect(wrapper.vm.disableAddPerson).toBe(true)
        wrapper.vm.newPerson = "jondoe"
        expect(wrapper.vm.disableAddPerson).toBe(true)
        expect(wrapper.vm.isDupPerson.get("jondoe")).toContain("already on the list")

        wrapper.vm.newPerson = "Jane Doe"
        expect(wrapper.vm.disableAddPerson).toBe(false)
    })

    it("adds the entered name and clears the input", () => {
        const wrapper = createWrapper()
        wrapper.vm.newPerson = "Jon Doe"

        wrapper.vm.addPersonAndClearNewPerson()

        expect(wrapper.vm.addPerson).toHaveBeenCalledWith("Jon Doe")
        expect(wrapper.vm.newPerson).toBe("")
    })

    it("only saves a non-empty, non-duplicate edited name", () => {
        const wrapper = createWrapper({
            peopleAttending: {
                peopleAttending: [{ name: "Jon Doe", edit: true, editName: "Jane Doe", nameDrawn: "" }]
            }
        })
        const person = wrapper.vm.peopleAttending[0]

        wrapper.vm.save(person)
        expect(wrapper.vm.updateName).toHaveBeenCalledWith(person, "Jane Doe")

        wrapper.vm.updateName.mockClear()
        person.editName = "jondoe"
        wrapper.vm.save(person)
        expect(wrapper.vm.updateName).not.toHaveBeenCalled()

        person.editName = ""
        wrapper.vm.save(person)
        expect(wrapper.vm.updateName).not.toHaveBeenCalled()
    })

    it("returns an error for an invalid navigation direction", () => {
        vi.spyOn(console, "error").mockImplementation(() => {})
        const wrapper = createWrapper()

        expect(wrapper.vm.goToDifferentPage("badDirection")).toBe("Error in AddPeople: badDirection is invalid")
    })
})