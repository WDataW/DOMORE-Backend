function quickSort(array, start, end, partition) {
    if (end <= start) {
        return;
    }
    const pivot = partition(array, start, end);
    quickSort(array, start, pivot - 1, partition);
    quickSort(array, pivot + 1, end, partition);

}
function partitionDate(array, start, end) {
    let i = start - 1;
    const pivot = new Date(array[end].dueDate).getTime();

    for (let j = start; j < end; j++) {
        if (new Date(array[j].dueDate).getTime() < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]]
        }
    }
    i++;
    [array[i], array[end]] = [array[end], array[i]];
    return i;

}

module.exports = { quickSort, partitionDate }