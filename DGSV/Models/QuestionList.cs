using DGSV.Models;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DGSV.Api.Models
{
    [Table("QuestionList")]
    public class QuestionList
    {
        [Key]
        public int Id { get; set; }
        public string ContentQuestion { get; set; }
        [ForeignKey("TypeQuestionId")]
        public int TypeQuestionId { get; set; }
        [ForeignKey("GroupQuestionId")]
        public int GroupQuestionId { get; set; }
        public int OrderBy { get; set; }
        public string UpdateBy { get; set; }
        public DateTime CreateDate { get; set; }
        public DateTime UpdateDate { get; set; }
        public bool Status { get; set; }
        public TypeQuestion TypeQuestion { get; set; }
        public GroupQuestion GroupQuestion { get; set; }
    
    }
}
