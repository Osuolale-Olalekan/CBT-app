import { AdminResultsPage } from '@/components/AdminResultPage'
import React from 'react'

interface AdminResultsPageParams {
  params: { examId: string }
}

const page = ({ params }: AdminResultsPageParams) => {
  return (
    <div>
      <AdminResultsPage examId={params.examId} />
    </div>
  )
}

export default page
