type SP = {
    name: string
    student_id_required?: boolean
    teacher_id_required?: boolean
}

export const SPList: SP[] = [
    {
        name: 'TeacherIns'
    },
    {
        name: 'TeacherCheck'
    },
    {
        name: 'StudentIns'
    },
    {
        name: 'StudentCheck'
    }
]