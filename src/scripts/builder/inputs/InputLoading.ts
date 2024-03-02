import { ref } from 'vue';

// Needs to be called when the input init is complete.
// export const setInputInitComplete = ref(undefined);
export let setInputInitComplete: CallableFunction;

// Await this to wait until the wallet init process is complete.
// export const inputInitComplete = ref(new Promise((resolve, _) => {
//     setInputInitComplete = resolve;
// }));

// export function resetInputComplete() {
//     inputInitComplete.value = new Promise((resolve, _) => {
//         setInputInitComplete = resolve;
//     });
// }

export let inputInitComplete = new Promise((resolve, _) => {
    setInputInitComplete = resolve;
});

export function resetInputComplete() {
    inputInitComplete = new Promise((resolve, _) => {
        setInputInitComplete = resolve;
    });
}
