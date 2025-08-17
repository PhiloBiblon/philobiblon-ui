<template>
    <div class="relative overflow-x-auto">
        <div
            class="w-full text-sm text-left gap-4 px-3 rtl:text-right text-gray-500 dark:text-gray-400 grid grid-cols-12 mb-3">
            <div class="col-span-4">
                <label for="status" class="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    Filter by status
                </label>
                <select v-model="filters.status" id="status"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option selected value="">Choose a status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                </select>
            </div>
            <div class="col-span-4">
                <label for="updatedAt" class="block mb-2 text-lg font-medium text-gray-900 dark:text-white">
                    Order by create date
                </label>
                <select v-model="filters.created_at_order_type" id="created_at"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option selected value="">Choose a status</option>
                    <option value="asc">Old to new</option>
                    <option value="desc">New to old</option>
                </select>
            </div>
            <div class="col-span-2 mt-8">
                <button @click="getProposes" type="button"
                        class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                    Filter
                </button>
            </div>
        </div>
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <template v-for="(value,key) in proposes[0]" :key="key">
                    <th scope="col" class="px-6 py-3" v-if="key !== 'claim_id'">
                        {{ formatTitle(key) }}
                    </th>
                </template>
                <th scope="col" class="px-6 py-3">
                    Actions
                </th>
            </tr>
            </thead>
            <tbody>
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700" v-for="propose in proposes">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ propose?.id }}
                </th>
                <th class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ propose?.item_id ?? '-' }}
                </th>
                <th class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ propose?.fingerprint ?? '-' }}
                </th>
                <th class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ propose?.status ?? '-' }}
                </th>
                <th class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ propose?.approved ?? '-' }}
                </th>
                <th class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {{ propose?.createdAt ?? '-' }}
                </th>
                <th class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded mr-2"
                            v-if="propose?.status === 'pending' "
                            @click="approve(propose?.id, propose?.item_id)">Approve
                    </button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                            :disabled="!isAdmin" @click="deletePropose(propose?.id)">Delete
                    </button>
                </th>
            </tr>
            </tbody>
        </table>
    </div>
</template>
<script setup>
import Swal from "sweetalert2";
import {computed, onMounted, ref} from 'vue';
import {useUserStore} from "@/store/UserStore";
import {useProposeStore} from "@/store/ProposeStore";

const userStore = useUserStore();
const proposeStore = useProposeStore();

let proposes = ref([]);
let filters = ref({
    status: '',
    created_at_order_type: '',
});

onMounted(() => {
    getProposes();
    Echo.channel('proposes')
        .listen('.ProposeCreated', () => {
            getProposes();
        });
})

const getProposes = () => {
    proposeStore.get(filters.value).then(() => {
        proposes.value = proposeStore.proposes;
    });
}
const formatTitle = (title) => {
    if (title =='createdAt'){
        return 'CREATED AT'
    }
    let result = title.replace(/_/g, ' ');
    return result.replace(/\b\w/g, char => char.toUpperCase());
}

const formatDate = (date) => {
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Date(date).toLocaleDateString(undefined, options);
}

const isAdmin = computed(() => {
    return userStore.auth.role_id === 1;
})
const approve = (id, itemId) => {
    // let textTo = JSON.parse(changedText)
    // window.open(`http://localhost:3000/item/${itemId}`, '_blank');
    proposeStore.approve(id).then((res) => {
        if (res.data.success) {
            Swal.fire({
                text: res.data.message,
                toast: true,
                position: 'top-end',
                icon: 'success',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
            getProposes()
        } else {
            Swal.fire({
                text: res.data.message,
                toast: true,
                position: 'top-end',
                icon: 'error',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        }
    })
}

const deletePropose = (id) => {
    Swal.fire({
        titleText: 'Are you sure you want to delete this propose?',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: 'Delete',
    }).then((res) => {
        if (res.isConfirmed) {
            proposeStore.delete(id).then((res) => {
                if (res.data.success) {
                    Swal.fire({
                        text: res.data.message,
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                    });
                    getProposes();
                }
            })
        }
    });
}
</script>
